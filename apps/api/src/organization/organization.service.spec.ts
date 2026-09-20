/* eslint-disable @typescript-eslint/unbound-method */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { OrganizationService } from './organization.service';
import { Organization } from './entities/organization.entity';
import { OrganizationMember } from './entities/organization-members.entity';
import { OrganizationRole } from './enums/organization-role.enum';

describe('OrganizationService', () => {
  let service: OrganizationService;

  let organizationRepository: jest.Mocked<Repository<Organization>>;
  let organizationMemberRepository: jest.Mocked<Repository<OrganizationMember>>;

  let dataSource: {
    transaction: jest.Mock;
  };

  beforeEach(async () => {
    organizationRepository = {
      createQueryBuilder: jest.fn(),
      delete: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<Organization>>;

    organizationMemberRepository = {
      findOne: jest.fn(),
      exists: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<OrganizationMember>>;

    dataSource = {
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        {
          provide: getRepositoryToken(Organization),
          useValue: organizationRepository,
        },
        {
          provide: getRepositoryToken(OrganizationMember),
          useValue: organizationMemberRepository,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an organization and owner membership', async () => {
      const userId = 'user-id';

      const dto = {
        name: 'DevFlow',
        description: 'Engineering project management platform',
      };

      const organization = {
        id: 'organization-id',
        name: dto.name,
        description: dto.description,
      } as Organization;

      const member = {
        organizationId: organization.id,
        userId,
        role: OrganizationRole.OWNER,
      } as OrganizationMember;

      const manager = {
        create: jest
          .fn()
          .mockReturnValueOnce(organization)
          .mockReturnValueOnce(member),
        save: jest
          .fn()
          .mockResolvedValueOnce(organization)
          .mockResolvedValueOnce(member),
      };

      dataSource.transaction.mockImplementation(
        (callback: (transactionManager: unknown) => Promise<unknown>) =>
          callback(manager),
      );

      jest.spyOn(service, 'findByName').mockResolvedValue(null);

      const result = await service.create(dto, userId);

      expect(result).toEqual(organization);

      expect(service.findByName).toHaveBeenCalledWith(dto.name, userId);

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);

      expect(manager.create).toHaveBeenNthCalledWith(1, Organization, {
        name: dto.name,
        description: dto.description,
      });

      expect(manager.save).toHaveBeenNthCalledWith(1, organization);

      expect(manager.create).toHaveBeenNthCalledWith(2, OrganizationMember, {
        organizationId: organization.id,
        userId,
        role: OrganizationRole.OWNER,
      });

      expect(manager.save).toHaveBeenNthCalledWith(2, member);
    });

    it('should reject duplicate organization name for the same user', async () => {
      const existingOrganization = {
        id: 'existing-organization-id',
        name: 'DevFlow',
      } as Organization;

      jest.spyOn(service, 'findByName').mockResolvedValue(existingOrganization);

      await expect(
        service.create(
          {
            name: 'DevFlow',
            description: 'Another organization',
          },
          'user-id',
        ),
      ).rejects.toThrow(
        new ConflictException(
          'You already have an organization with this name',
        ),
      );

      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should propagate transaction errors', async () => {
      const error = new Error('Database error');

      jest.spyOn(service, 'findByName').mockResolvedValue(null);

      dataSource.transaction.mockRejectedValue(error);

      await expect(
        service.create(
          {
            name: 'DevFlow',
            description: 'Engineering platform',
          },
          'user-id',
        ),
      ).rejects.toThrow(error);
    });
  });

  describe('findByName', () => {
    it('should return the organization when found', async () => {
      const organization = {
        id: 'organization-id',
        name: 'DevFlow',
      } as Organization;

      const queryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(organization),
      };

      organizationRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as unknown as SelectQueryBuilder<Organization>,
      );

      const result = await service.findByName('DevFlow', 'user-id');

      expect(result).toEqual(organization);

      expect(organizationRepository.createQueryBuilder).toHaveBeenCalledWith(
        'organization',
      );

      expect(queryBuilder.innerJoin).toHaveBeenCalledWith(
        OrganizationMember,
        'member',
        'member.organization_id = organization.id',
      );

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'member.user_id = :userId',
        {
          userId: 'user-id',
        },
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(organization.name) = LOWER(:name)',
        {
          name: 'DevFlow',
        },
      );

      expect(queryBuilder.getOne).toHaveBeenCalledTimes(1);
    });

    it('should return null when the organization does not exist', async () => {
      const queryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      organizationRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as unknown as SelectQueryBuilder<Organization>,
      );

      const result = await service.findByName('Unknown', 'user-id');

      expect(result).toBeNull();
    });
  });

  describe('getUserOrganizations', () => {
    it('should return the user organizations', async () => {
      const organizations = [
        {
          id: 'organization-id',
          name: 'DevFlow',
          slug: 'devflow',
          description: 'Engineering platform',
          userId: 'user-id',
          role: OrganizationRole.OWNER,
          memberCount: 3,
        },
      ];

      const queryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(organizations),
      };

      organizationRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as unknown as SelectQueryBuilder<Organization>,
      );

      const result = await service.getUserOrganizations('user-id');

      expect(result).toEqual(organizations);

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'member.user_id = :userId',
        {
          userId: 'user-id',
        },
      );

      expect(queryBuilder.getRawMany).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when the user has no organizations', async () => {
      const queryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      organizationRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as unknown as SelectQueryBuilder<Organization>,
      );

      const result = await service.getUserOrganizations('user-id');

      expect(result).toEqual([]);
    });
  });

  describe('getOrgMembers', () => {
    it('should return organization members for a member', async () => {
      organizationMemberRepository.exists.mockResolvedValue(true);

      const members = [
        {
          organizationId: 'organization-id',
          userId: 'user-id',
          role: OrganizationRole.OWNER,
        },
      ] as OrganizationMember[];

      const queryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(members),
      };

      organizationMemberRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as unknown as SelectQueryBuilder<OrganizationMember>,
      );

      const result = await service.getOrgMembers('user-id', 'organization-id');

      expect(result).toEqual(members);

      expect(organizationMemberRepository.exists).toHaveBeenCalledWith({
        where: {
          organizationId: 'organization-id',
          userId: 'user-id',
        },
      });

      expect(queryBuilder.getMany).toHaveBeenCalledTimes(1);
    });

    it('should throw when the user is not a member', async () => {
      organizationMemberRepository.exists.mockResolvedValue(false);

      await expect(
        service.getOrgMembers('user-id', 'organization-id'),
      ).rejects.toThrow(new NotFoundException('Organization not found'));

      expect(
        organizationMemberRepository.createQueryBuilder,
      ).not.toHaveBeenCalled();
    });
  });

  describe('getOrganization', () => {
    it('should return the organization for a member', async () => {
      const organization = {
        id: 'organization-id',
        name: 'DevFlow',
        slug: 'devflow',
        description: 'Engineering platform',
      } as Organization;

      const queryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(organization),
      };

      organizationRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as unknown as SelectQueryBuilder<Organization>,
      );

      const result = await service.getOrganization(
        'user-id',
        'organization-id',
      );

      expect(result).toEqual(organization);

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'organization.id = :organizationId',
        {
          organizationId: 'organization-id',
        },
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'member.user_id = :userId',
        {
          userId: 'user-id',
        },
      );
    });

    it('should throw when the user is not a member', async () => {
      const queryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      organizationRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as unknown as SelectQueryBuilder<Organization>,
      );

      await expect(
        service.getOrganization('user-id', 'organization-id'),
      ).rejects.toThrow(new NotFoundException('Organization not found'));
    });
  });

  describe('deleteOrganization', () => {
    it('should delete the organization when the requester is the owner', async () => {
      organizationMemberRepository.findOne.mockResolvedValue({
        organizationId: 'organization-id',
        userId: 'user-id',
        role: OrganizationRole.OWNER,
      } as OrganizationMember);

      organizationRepository.delete.mockResolvedValue({
        affected: 1,
        raw: {},
      });

      await service.deleteOrganization('user-id', 'organization-id');

      expect(organizationMemberRepository.findOne).toHaveBeenCalledWith({
        where: {
          organizationId: 'organization-id',
          userId: 'user-id',
        },
      });

      expect(organizationRepository.delete).toHaveBeenCalledWith(
        'organization-id',
      );
    });

    it('should throw when the requester is not a member', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteOrganization('user-id', 'organization-id'),
      ).rejects.toThrow(new NotFoundException('Organization not found'));

      expect(organizationRepository.delete).not.toHaveBeenCalled();
    });

    it.each([
      OrganizationRole.MANAGER,
      OrganizationRole.DEVELOPER,
      OrganizationRole.VIEWER,
    ])('should reject %s from deleting the organization', async (role) => {
      organizationMemberRepository.findOne.mockResolvedValue({
        organizationId: 'organization-id',
        userId: 'user-id',
        role,
      } as OrganizationMember);

      await expect(
        service.deleteOrganization('user-id', 'organization-id'),
      ).rejects.toThrow(
        new ConflictException(
          'Only the organization owner can delete the organization',
        ),
      );

      expect(organizationRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('leaveOrganization', () => {
    it('should allow a non-owner member to leave', async () => {
      organizationMemberRepository.findOne.mockResolvedValue({
        organizationId: 'organization-id',
        userId: 'user-id',
        role: OrganizationRole.DEVELOPER,
      } as OrganizationMember);

      organizationMemberRepository.delete.mockResolvedValue({
        affected: 1,
        raw: {},
      });

      await service.leaveOrganization('user-id', 'organization-id');

      expect(organizationMemberRepository.delete).toHaveBeenCalledWith({
        organizationId: 'organization-id',
        userId: 'user-id',
      });
    });

    it('should throw when the user is not a member', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(null);

      await expect(
        service.leaveOrganization('user-id', 'organization-id'),
      ).rejects.toThrow(new NotFoundException('Organization not found'));

      expect(organizationMemberRepository.delete).not.toHaveBeenCalled();
    });

    it('should prevent the owner from leaving', async () => {
      organizationMemberRepository.findOne.mockResolvedValue({
        organizationId: 'organization-id',
        userId: 'user-id',
        role: OrganizationRole.OWNER,
      } as OrganizationMember);

      await expect(
        service.leaveOrganization('user-id', 'organization-id'),
      ).rejects.toThrow(
        new ConflictException(
          'The organization owner cannot leave the organization',
        ),
      );

      expect(organizationMemberRepository.delete).not.toHaveBeenCalled();
    });

    it.each([
      OrganizationRole.MANAGER,
      OrganizationRole.DEVELOPER,
      OrganizationRole.VIEWER,
    ])('should allow %s to leave the organization', async (role) => {
      organizationMemberRepository.findOne.mockResolvedValue({
        organizationId: 'organization-id',
        userId: 'user-id',
        role,
      } as OrganizationMember);

      organizationMemberRepository.delete.mockResolvedValue({
        affected: 1,
        raw: {},
      });

      await service.leaveOrganization('user-id', 'organization-id');

      expect(organizationMemberRepository.delete).toHaveBeenCalledWith({
        organizationId: 'organization-id',
        userId: 'user-id',
      });
    });
  });

  describe('updateOrganization', () => {
    it('should update the organization when the requester is the owner', async () => {
      const organization = {
        id: 'organization-id',
        name: 'Old Name',
        description: 'Old description',
      } as Organization;

      const dto = {
        name: 'New Name',
        description: 'New description',
      };

      organizationMemberRepository.findOne.mockResolvedValue({
        organizationId: 'organization-id',
        userId: 'user-id',
        role: OrganizationRole.OWNER,
      } as OrganizationMember);

      organizationRepository.findOne = jest
        .fn()
        .mockResolvedValue(organization);
      organizationRepository.save = jest.fn().mockResolvedValue({
        ...organization,
        ...dto,
      });

      const result = await service.updateOrganization(
        'user-id',
        'organization-id',
        dto,
      );

      expect(result).toEqual({
        ...organization,
        ...dto,
      });

      expect(organizationMemberRepository.findOne).toHaveBeenCalledWith({
        where: {
          organizationId: 'organization-id',
          userId: 'user-id',
        },
      });

      expect(organizationRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'organization-id',
        },
      });

      expect(organizationRepository.save).toHaveBeenCalledWith(organization);
    });

    it('should allow a manager to update the organization', async () => {
      const organization = {
        id: 'organization-id',
        name: 'DevFlow',
      } as Organization;

      const dto = {
        description: 'Updated description',
      };

      organizationMemberRepository.findOne.mockResolvedValue({
        organizationId: 'organization-id',
        userId: 'user-id',
        role: OrganizationRole.MANAGER,
      } as OrganizationMember);

      organizationRepository.findOne = jest
        .fn()
        .mockResolvedValue(organization);
      organizationRepository.save = jest.fn().mockResolvedValue({
        ...organization,
        ...dto,
      });

      const result = await service.updateOrganization(
        'user-id',
        'organization-id',
        dto,
      );

      expect(result).toEqual({
        ...organization,
        ...dto,
      });

      expect(organizationRepository.save).toHaveBeenCalledWith(organization);
    });

    it.each([OrganizationRole.DEVELOPER, OrganizationRole.VIEWER])(
      'should reject %s from updating the organization',
      async (role) => {
        organizationRepository.findOne.mockResolvedValue({
          id: 'organization-id',
          name: 'Test Organization',
          description: 'Test description',
        } as Organization);

        organizationMemberRepository.findOne.mockResolvedValue({
          organizationId: 'organization-id',
          userId: 'user-id',
          role,
        } as OrganizationMember);

        await expect(
          service.updateOrganization('user-id', 'organization-id', {
            name: 'New Name',
          }),
        ).rejects.toThrow(
          new ForbiddenException(
            'You do not have permission to update this organization',
          ),
        );

        expect(organizationRepository.findOne).toHaveBeenCalledWith({
          where: {
            id: 'organization-id',
          },
        });

        expect(organizationMemberRepository.findOne).toHaveBeenCalledWith({
          where: {
            organizationId: 'organization-id',
            userId: 'user-id',
          },
        });

        expect(organizationRepository.save).not.toHaveBeenCalled();
      },
    );

    it('should throw when the requester is not a member', async () => {
      organizationRepository.findOne.mockResolvedValue({
        id: 'organization-id',
        name: 'Test Organization',
        description: 'Test description',
      } as Organization);

      organizationMemberRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateOrganization('user-id', 'organization-id', {
          name: 'New Name',
        }),
      ).rejects.toThrow(
        new ForbiddenException('You are not a member of this organization'),
      );

      expect(organizationRepository.save).not.toHaveBeenCalled();
    });

    it('should throw when the organization does not exist', async () => {
      organizationMemberRepository.findOne.mockResolvedValue({
        organizationId: 'organization-id',
        userId: 'user-id',
        role: OrganizationRole.OWNER,
      } as OrganizationMember);

      organizationRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        service.updateOrganization('user-id', 'organization-id', {
          name: 'New Name',
        }),
      ).rejects.toThrow(new NotFoundException('Organization not found'));

      expect(organizationRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('updateMemberRole', () => {
    it('should allow the owner to change a member role', async () => {
      const member = {
        organizationId: 'organization-id',
        userId: 'target-user-id',
        role: OrganizationRole.DEVELOPER,
      } as OrganizationMember;

      organizationMemberRepository.findOne
        .mockResolvedValueOnce({
          organizationId: 'organization-id',
          userId: 'owner-id',
          role: OrganizationRole.OWNER,
        } as OrganizationMember)
        .mockResolvedValueOnce(member);

      organizationMemberRepository.save = jest.fn().mockResolvedValue({
        ...member,
        role: OrganizationRole.MANAGER,
      });

      const result = await service.updateMemberRole(
        'owner-id',
        'organization-id',
        'target-user-id',
        OrganizationRole.MANAGER,
      );

      expect(result).toEqual({
        ...member,
        role: OrganizationRole.MANAGER,
      });

      expect(member.role).toBe(OrganizationRole.MANAGER);

      expect(organizationMemberRepository.save).toHaveBeenCalledWith(member);
    });

    it('should reject a requester who is not a member', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateMemberRole(
          'user-id',
          'organization-id',
          'target-user-id',
          OrganizationRole.MANAGER,
        ),
      ).rejects.toThrow(
        new ForbiddenException('You are not a member of this organization'),
      );

      expect(organizationMemberRepository.save).not.toHaveBeenCalled();
    });

    it.each([
      OrganizationRole.MANAGER,
      OrganizationRole.DEVELOPER,
      OrganizationRole.VIEWER,
    ])('should reject %s from changing member roles', async (role) => {
      organizationMemberRepository.findOne.mockResolvedValue({
        organizationId: 'organization-id',
        userId: 'user-id',
        role,
      } as OrganizationMember);

      await expect(
        service.updateMemberRole(
          'user-id',
          'organization-id',
          'target-user-id',
          OrganizationRole.DEVELOPER,
        ),
      ).rejects.toThrow(
        new ForbiddenException(
          'Only the organization owner can change member roles',
        ),
      );

      expect(organizationMemberRepository.save).not.toHaveBeenCalled();
    });

    it('should reject assigning the owner role', async () => {
      organizationMemberRepository.findOne.mockResolvedValue({
        organizationId: 'organization-id',
        userId: 'owner-id',
        role: OrganizationRole.OWNER,
      } as OrganizationMember);

      await expect(
        service.updateMemberRole(
          'owner-id',
          'organization-id',
          'target-user-id',
          OrganizationRole.OWNER,
        ),
      ).rejects.toThrow(
        new BadRequestException('The owner role cannot be assigned'),
      );

      expect(organizationMemberRepository.save).not.toHaveBeenCalled();
    });

    it('should throw when the target member does not exist', async () => {
      organizationMemberRepository.findOne
        .mockResolvedValueOnce({
          organizationId: 'organization-id',
          userId: 'owner-id',
          role: OrganizationRole.OWNER,
        } as OrganizationMember)
        .mockResolvedValueOnce(null);

      await expect(
        service.updateMemberRole(
          'owner-id',
          'organization-id',
          'target-user-id',
          OrganizationRole.MANAGER,
        ),
      ).rejects.toThrow(new NotFoundException('Organization member not found'));

      expect(organizationMemberRepository.save).not.toHaveBeenCalled();
    });

    it('should reject changing the owner role', async () => {
      organizationMemberRepository.findOne
        .mockResolvedValueOnce({
          organizationId: 'organization-id',
          userId: 'owner-id',
          role: OrganizationRole.OWNER,
        } as OrganizationMember)
        .mockResolvedValueOnce({
          organizationId: 'organization-id',
          userId: 'target-owner-id',
          role: OrganizationRole.OWNER,
        } as OrganizationMember);

      await expect(
        service.updateMemberRole(
          'owner-id',
          'organization-id',
          'target-owner-id',
          OrganizationRole.MANAGER,
        ),
      ).rejects.toThrow(
        new BadRequestException('The owner role cannot be changed'),
      );

      expect(organizationMemberRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('removeMember', () => {
    it('should allow the owner to remove a member', async () => {
      const member = {
        organizationId: 'organization-id',
        userId: 'target-user-id',
        role: OrganizationRole.DEVELOPER,
      } as OrganizationMember;

      organizationMemberRepository.findOne
        .mockResolvedValueOnce({
          organizationId: 'organization-id',
          userId: 'owner-id',
          role: OrganizationRole.OWNER,
        } as OrganizationMember)
        .mockResolvedValueOnce(member);

      organizationMemberRepository.remove = jest.fn().mockResolvedValue(member);

      await service.removeMember(
        'owner-id',
        'organization-id',
        'target-user-id',
      );

      expect(organizationMemberRepository.remove).toHaveBeenCalledWith(member);
    });

    it('should allow the owner to remove a manager', async () => {
      const member = {
        organizationId: 'organization-id',
        userId: 'manager-id',
        role: OrganizationRole.MANAGER,
      } as OrganizationMember;

      organizationMemberRepository.findOne
        .mockResolvedValueOnce({
          organizationId: 'organization-id',
          userId: 'owner-id',
          role: OrganizationRole.OWNER,
        } as OrganizationMember)
        .mockResolvedValueOnce(member);

      organizationMemberRepository.remove = jest.fn().mockResolvedValue(member);

      await service.removeMember('owner-id', 'organization-id', 'manager-id');

      expect(organizationMemberRepository.remove).toHaveBeenCalledWith(member);
    });

    it('should allow a manager to remove a developer', async () => {
      const member = {
        organizationId: 'organization-id',
        userId: 'developer-id',
        role: OrganizationRole.DEVELOPER,
      } as OrganizationMember;

      organizationMemberRepository.findOne
        .mockResolvedValueOnce({
          organizationId: 'organization-id',
          userId: 'manager-id',
          role: OrganizationRole.MANAGER,
        } as OrganizationMember)
        .mockResolvedValueOnce(member);

      organizationMemberRepository.remove = jest.fn().mockResolvedValue(member);

      await service.removeMember(
        'manager-id',
        'organization-id',
        'developer-id',
      );

      expect(organizationMemberRepository.remove).toHaveBeenCalledWith(member);
    });

    it('should allow a manager to remove a viewer', async () => {
      const member = {
        organizationId: 'organization-id',
        userId: 'viewer-id',
        role: OrganizationRole.VIEWER,
      } as OrganizationMember;

      organizationMemberRepository.findOne
        .mockResolvedValueOnce({
          organizationId: 'organization-id',
          userId: 'manager-id',
          role: OrganizationRole.MANAGER,
        } as OrganizationMember)
        .mockResolvedValueOnce(member);

      organizationMemberRepository.remove = jest.fn().mockResolvedValue(member);

      await service.removeMember('manager-id', 'organization-id', 'viewer-id');

      expect(organizationMemberRepository.remove).toHaveBeenCalledWith(member);
    });

    it('should reject a requester who is not a member', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeMember('user-id', 'organization-id', 'target-user-id'),
      ).rejects.toThrow(
        new ForbiddenException('You are not a member of this organization'),
      );

      expect(organizationMemberRepository.remove).not.toHaveBeenCalled();
    });

    it.each([OrganizationRole.DEVELOPER, OrganizationRole.VIEWER])(
      'should reject %s from removing members',
      async (role) => {
        organizationMemberRepository.findOne.mockResolvedValue({
          organizationId: 'organization-id',
          userId: 'user-id',
          role,
        } as OrganizationMember);

        await expect(
          service.removeMember('user-id', 'organization-id', 'target-user-id'),
        ).rejects.toThrow(
          new ForbiddenException(
            'You do not have permission to remove members',
          ),
        );

        expect(organizationMemberRepository.remove).not.toHaveBeenCalled();
      },
    );

    it('should throw when the target member does not exist', async () => {
      organizationMemberRepository.findOne
        .mockResolvedValueOnce({
          organizationId: 'organization-id',
          userId: 'owner-id',
          role: OrganizationRole.OWNER,
        } as OrganizationMember)
        .mockResolvedValueOnce(null);

      await expect(
        service.removeMember('owner-id', 'organization-id', 'target-user-id'),
      ).rejects.toThrow(new NotFoundException('Organization member not found'));

      expect(organizationMemberRepository.remove).not.toHaveBeenCalled();
    });

    it('should prevent removing the organization owner', async () => {
      organizationMemberRepository.findOne
        .mockResolvedValueOnce({
          organizationId: 'organization-id',
          userId: 'owner-id',
          role: OrganizationRole.OWNER,
        } as OrganizationMember)
        .mockResolvedValueOnce({
          organizationId: 'organization-id',
          userId: 'another-owner-id',
          role: OrganizationRole.OWNER,
        } as OrganizationMember);

      await expect(
        service.removeMember('owner-id', 'organization-id', 'another-owner-id'),
      ).rejects.toThrow(
        new BadRequestException('The organization owner cannot be removed'),
      );

      expect(organizationMemberRepository.remove).not.toHaveBeenCalled();
    });

    it('should prevent a manager from removing another manager', async () => {
      organizationMemberRepository.findOne
        .mockResolvedValueOnce({
          organizationId: 'organization-id',
          userId: 'manager-id',
          role: OrganizationRole.MANAGER,
        } as OrganizationMember)
        .mockResolvedValueOnce({
          organizationId: 'organization-id',
          userId: 'another-manager-id',
          role: OrganizationRole.MANAGER,
        } as OrganizationMember);

      await expect(
        service.removeMember(
          'manager-id',
          'organization-id',
          'another-manager-id',
        ),
      ).rejects.toThrow(
        new ForbiddenException('Managers cannot remove other managers'),
      );

      expect(organizationMemberRepository.remove).not.toHaveBeenCalled();
    });
  });
});
