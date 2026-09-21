/* eslint-disable @typescript-eslint/unbound-method */

import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';

import { InvitationService } from './invitation.service';
import { OrganizationInvitation } from './entities/organization-invitation.entity';
import { InvitationStatus } from './enums/invitation-status.enum';
import { OrganizationMember } from '../organization/entities/organization-members.entity';
import { OrganizationRole } from '../organization/enums/organization-role.enum';
import { UsersService } from '../users/users.service';
import { OrganizationService } from '../organization/organization.service';
import { Organization } from '../organization/entities/organization.entity';
import { InvitableOrganizationRole } from '../organization/enums/invitable-organization-role.enum';

describe('InvitationService', () => {
  let service: InvitationService;

  let invitationRepository: jest.Mocked<Repository<OrganizationInvitation>>;
  let organizationMemberRepository: jest.Mocked<Repository<OrganizationMember>>;
  let usersService: jest.Mocked<UsersService>;
  let dataSource: jest.Mocked<DataSource>;
  let configService: jest.Mocked<ConfigService>;
  let organizationService: jest.Mocked<OrganizationService>;

  const userId = 'user-id';
  const organizationId = 'organization-id';
  const invitationId = 'invitation-id';

  const createInvitation = (
    overrides: Partial<OrganizationInvitation> = {},
  ): OrganizationInvitation =>
    ({
      id: invitationId,
      organizationId,
      invitedUserId: userId,
      role: OrganizationRole.DEVELOPER,
      status: InvitationStatus.PENDING,
      expiresAt: new Date(Date.now() + 60_000),
      ...overrides,
    }) as OrganizationInvitation;

  beforeEach(() => {
    invitationRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<OrganizationInvitation>>;

    organizationMemberRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<OrganizationMember>>;

    usersService = {
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    dataSource = {
      transaction: jest.fn(),
    } as unknown as jest.Mocked<DataSource>;

    configService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    organizationService = {
      getOrganization: jest.fn(),
    } as unknown as jest.Mocked<OrganizationService>;

    service = new InvitationService(
      invitationRepository,
      organizationMemberRepository,
      usersService,
      dataSource,
      configService,
      organizationService,
    );
  });

  describe('inviteMember', () => {
    const dto = {
      invitedUserEmail: 'john@example.com',
      role: InvitableOrganizationRole.DEVELOPER,
    };

    const ownerMembership = {
      organizationId,
      userId,
      role: OrganizationRole.OWNER,
    } as OrganizationMember;

    const invitedUser = {
      id: 'invited-user-id',
      email: dto.invitedUserEmail,
    };

    const organization = {
      id: organizationId,
      name: 'DevFlow',
    } as Organization;

    it('should invite a user successfully', async () => {
      const createdInvitation = {
        organizationId,
        invitedUserId: invitedUser.id,
        invitedBy: userId,
        role: dto.role,
        status: InvitationStatus.PENDING,
      } as OrganizationInvitation;

      const savedInvitation = {
        ...createdInvitation,
        id: invitationId,
      };

      organizationMemberRepository.findOne
        .mockResolvedValueOnce(ownerMembership)
        .mockResolvedValueOnce(null);

      organizationService.getOrganization.mockResolvedValue(organization);

      usersService.findByEmail.mockResolvedValue(invitedUser as never);

      invitationRepository.findOne.mockResolvedValue(null);

      configService.get.mockReturnValue(3600);

      invitationRepository.create.mockReturnValue(createdInvitation);

      invitationRepository.save.mockResolvedValue(savedInvitation);

      const result = await service.inviteMember(dto, userId, organizationId);

      expect(result).toBe(savedInvitation);

      expect(invitationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId,
          invitedUserId: invitedUser.id,
          invitedBy: userId,
          role: dto.role,
          status: InvitationStatus.PENDING,
          expiresAt: expect.any(Date) as unknown,
        }),
      );

      expect(invitationRepository.save).toHaveBeenCalledWith(createdInvitation);
    });

    it('should reject a non-member', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(null);

      await expect(
        service.inviteMember(dto, userId, organizationId),
      ).rejects.toThrow(
        new ForbiddenException('You are not a member of this organization'),
      );

      expect(organizationService.getOrganization).not.toHaveBeenCalled();
    });

    it('should reject a member who is not the owner', async () => {
      organizationMemberRepository.findOne.mockResolvedValue({
        ...ownerMembership,
        role: OrganizationRole.DEVELOPER,
      });

      await expect(
        service.inviteMember(dto, userId, organizationId),
      ).rejects.toThrow(
        new ForbiddenException('You do not have permission to invite members'),
      );
    });

    it('should throw when the organization does not exist', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(ownerMembership);

      organizationService.getOrganization.mockResolvedValue(null as never);

      await expect(
        service.inviteMember(dto, userId, organizationId),
      ).rejects.toThrow(new NotFoundException('Organization not found'));
    });

    it('should throw when the invited user does not exist', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(ownerMembership);

      organizationService.getOrganization.mockResolvedValue(organization);

      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.inviteMember(dto, userId, organizationId),
      ).rejects.toThrow(
        new NotFoundException('User with this email does not exist'),
      );
    });

    it('should reject an existing organization member', async () => {
      organizationMemberRepository.findOne
        .mockResolvedValueOnce(ownerMembership)
        .mockResolvedValueOnce({
          organizationId,
          userId: 'invited-user-id',
          role: OrganizationRole.DEVELOPER,
        } as OrganizationMember);

      organizationService.getOrganization.mockResolvedValue(organization);

      usersService.findByEmail.mockResolvedValue(invitedUser as never);

      await expect(
        service.inviteMember(dto, userId, organizationId),
      ).rejects.toThrow(
        new ConflictException('User is already a member of this organization'),
      );
    });

    it('should reject an existing pending invitation', async () => {
      organizationMemberRepository.findOne
        .mockResolvedValueOnce(ownerMembership)
        .mockResolvedValueOnce(null);

      organizationService.getOrganization.mockResolvedValue(organization);

      usersService.findByEmail.mockResolvedValue(invitedUser as never);

      invitationRepository.findOne.mockResolvedValue({
        id: invitationId,
        status: InvitationStatus.PENDING,
      } as OrganizationInvitation);

      await expect(
        service.inviteMember(dto, userId, organizationId),
      ).rejects.toThrow(
        new ConflictException(
          'A pending invitation already exists for this user',
        ),
      );
    });

    it('should throw when invitation expiration config is missing', async () => {
      organizationMemberRepository.findOne
        .mockResolvedValueOnce(ownerMembership)
        .mockResolvedValueOnce(null);

      organizationService.getOrganization.mockResolvedValue(organization);

      usersService.findByEmail.mockResolvedValue(invitedUser as never);

      invitationRepository.findOne.mockResolvedValue(null);

      configService.get.mockReturnValue(undefined);

      await expect(
        service.inviteMember(dto, userId, organizationId),
      ).rejects.toThrow('Invitation expiration configuration is missing');
    });
  });

  describe('getUserInvitations', () => {
    it('should return the user invitations ordered by creation date', async () => {
      const invitations = [
        {
          id: 'invitation-2',
          invitedUserId: userId,
        },
        {
          id: 'invitation-1',
          invitedUserId: userId,
        },
      ] as OrganizationInvitation[];

      invitationRepository.find.mockResolvedValue(invitations);

      const result = await service.getUserInvitations(userId);

      expect(result).toBe(invitations);

      expect(invitationRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            invitedUserId: userId,
          },
          order: {
            createdAt: 'DESC',
          },
        }),
      );
    });
  });

  describe('acceptInvitation', () => {
    let manager: {
      save: jest.Mock;
      create: jest.Mock;
    };

    beforeEach(() => {
      manager = {
        save: jest.fn(),
        create: jest.fn(),
      };

      (dataSource.transaction as jest.Mock).mockImplementation(
        (callback: (transactionManager: typeof manager) => unknown) =>
          callback(manager),
      );
    });

    it('should accept a valid invitation', async () => {
      const pendingInvitation = createInvitation();

      const member = {
        organizationId,
        userId,
        role: OrganizationRole.DEVELOPER,
      } as OrganizationMember;

      invitationRepository.findOne.mockResolvedValue(pendingInvitation);

      // Existing-member check happens BEFORE the transaction.
      organizationMemberRepository.findOne.mockResolvedValue(null);

      manager.create.mockReturnValue(member);

      manager.save
        .mockResolvedValueOnce(member)
        .mockResolvedValueOnce(pendingInvitation);

      const result = await service.acceptInvitation(invitationId, userId);

      expect(result).toBe(member);

      expect(invitationRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: invitationId,
          invitedUserId: userId,
        },
      });

      expect(organizationMemberRepository.findOne).toHaveBeenCalledWith({
        where: {
          organizationId,
          userId,
        },
      });

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);

      expect(manager.create).toHaveBeenCalledWith(OrganizationMember, {
        organizationId,
        userId,
        role: OrganizationRole.DEVELOPER,
      });

      expect(manager.save).toHaveBeenCalledWith(OrganizationMember, member);

      expect(pendingInvitation.status).toBe(InvitationStatus.ACCEPTED);

      expect(manager.save).toHaveBeenCalledWith(
        OrganizationInvitation,
        pendingInvitation,
      );
    });

    it('should throw when invitation does not exist', async () => {
      invitationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.acceptInvitation(invitationId, userId),
      ).rejects.toThrow(new NotFoundException('Invitation not found'));

      expect(dataSource.transaction).not.toHaveBeenCalled();

      expect(organizationMemberRepository.findOne).not.toHaveBeenCalled();
    });

    it('should reject an already processed invitation', async () => {
      const invitation = createInvitation({
        status: InvitationStatus.DECLINED,
      });

      invitationRepository.findOne.mockResolvedValue(invitation);

      await expect(
        service.acceptInvitation(invitationId, userId),
      ).rejects.toThrow(
        new ConflictException('Invitation is already declined'),
      );

      expect(dataSource.transaction).not.toHaveBeenCalled();

      expect(organizationMemberRepository.findOne).not.toHaveBeenCalled();
    });

    it('should mark an expired invitation as expired', async () => {
      const expiredInvitation = createInvitation({
        expiresAt: new Date(Date.now() - 60_000),
      });

      invitationRepository.findOne.mockResolvedValue(expiredInvitation);

      invitationRepository.save.mockResolvedValue(expiredInvitation);

      await expect(
        service.acceptInvitation(invitationId, userId),
      ).rejects.toThrow(new ConflictException('Invitation has expired'));

      expect(expiredInvitation.status).toBe(InvitationStatus.EXPIRED);

      expect(invitationRepository.save).toHaveBeenCalledWith(expiredInvitation);

      expect(dataSource.transaction).not.toHaveBeenCalled();

      expect(organizationMemberRepository.findOne).not.toHaveBeenCalled();
    });

    it('should cancel the invitation when the user is already a member', async () => {
      const pendingInvitation = createInvitation();

      const existingMember = {
        organizationId,
        userId,
        role: OrganizationRole.DEVELOPER,
      } as OrganizationMember;

      invitationRepository.findOne.mockResolvedValue(pendingInvitation);

      // Existing-member check happens BEFORE the transaction.
      organizationMemberRepository.findOne.mockResolvedValue(existingMember);

      invitationRepository.save.mockResolvedValue(pendingInvitation);

      await expect(
        service.acceptInvitation(invitationId, userId),
      ).rejects.toThrow(
        new ConflictException('You are already a member of this organization'),
      );

      expect(organizationMemberRepository.findOne).toHaveBeenCalledWith({
        where: {
          organizationId,
          userId,
        },
      });

      expect(pendingInvitation.status).toBe(InvitationStatus.CANCELLED);

      expect(invitationRepository.save).toHaveBeenCalledWith(pendingInvitation);

      expect(dataSource.transaction).not.toHaveBeenCalled();

      expect(manager.create).not.toHaveBeenCalled();

      expect(manager.save).not.toHaveBeenCalled();
    });
  });
});
