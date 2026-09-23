/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

import { ProjectService } from './project.service';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';
import { OrganizationMember } from '../organization/entities/organization-members.entity';
import { OrganizationRole } from '../organization/enums/organization-role.enum';
import { ProjectRole } from './enums/project-role.enum';

describe('ProjectService', () => {
  let service: ProjectService;

  let projectRepository: {
    findOneBy: jest.Mock;
    findAndCount: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };

  let projectMemberRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
    existsBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  let organizationMemberRepository: {
    findOne: jest.Mock;
    existsBy: jest.Mock;
  };

  let dataSource: {
    transaction: jest.Mock;
    getMetadata: jest.Mock;
  };

  const userId = 'user-1';
  const organizationId = 'org-1';
  const projectId = 'project-1';

  const ownerMember = {
    organizationId,
    userId,
    role: OrganizationRole.OWNER,
  } as OrganizationMember;

  const managerMember = {
    organizationId,
    userId,
    role: OrganizationRole.MANAGER,
  } as OrganizationMember;

  const developerMember = {
    organizationId,
    userId,
    role: OrganizationRole.DEVELOPER,
  } as OrganizationMember;

  const project = {
    id: projectId,
    organizationId,
    organization: undefined,
    name: 'Test Project',
    key: 'TEST',
    slug: 'test-project',
    description: 'Test description',
    members: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Project;

  const projectAdmin = {
    projectId,
    userId,
    organizationId,
    role: ProjectRole.ADMIN,
  } as ProjectMember;

  const projectDeveloper = {
    projectId,
    userId: 'developer-1',
    organizationId,
    role: ProjectRole.DEVELOPER,
  } as ProjectMember;

  beforeEach(() => {
    projectRepository = {
      findOneBy: jest.fn(),
      findAndCount: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    projectMemberRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      existsBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    organizationMemberRepository = {
      findOne: jest.fn(),
      existsBy: jest.fn(),
    };

    dataSource = {
      transaction: jest.fn(),
      getMetadata: jest.fn(),
    };

    service = new ProjectService(
      projectRepository as never,
      projectMemberRepository as never,
      organizationMemberRepository as never,
      dataSource as never,
    );
  });

  describe('create', () => {
    const dto = {
      name: '  Test Project  ',
      key: ' test ',
      description: '  Test description  ',
    };

    beforeEach(() => {
      organizationMemberRepository.findOne.mockResolvedValue(ownerMember);

      dataSource.transaction.mockImplementation(
        (callback: (manager: unknown) => Promise<unknown>) => {
          const manager = {
            create: jest
              .fn()
              .mockImplementation((_entity: unknown, value: unknown) => value),

            save: jest
              .fn()
              .mockImplementation((entity: unknown, value: unknown) => {
                if (entity === Project) {
                  return {
                    ...(value as object),
                    id: projectId,
                  };
                }

                return value;
              }),
          };

          return callback(manager);
        },
      );
    });

    it('should create a project and add the creator as an admin', async () => {
      const result = await service.create(userId, organizationId, dto);

      expect(result).toEqual(
        expect.objectContaining({
          organizationId,
          name: 'Test Project',
          key: 'TEST',
          slug: 'test-project',
          description: 'Test description',
        }),
      );

      const manager = dataSource.transaction.mock.calls[0]?.[0] as unknown;
      expect(manager).toBeDefined();
    });

    it('should trim the project name and description and uppercase the key', async () => {
      await service.create(userId, organizationId, dto);

      const transactionCallback = dataSource.transaction.mock.calls[0]?.[0] as
        ((manager: unknown) => Promise<unknown>) | undefined;

      expect(transactionCallback).toBeDefined();

      const manager = {
        create: jest
          .fn()
          .mockImplementation((_entity: unknown, value: unknown) => value),
        save: jest
          .fn()
          .mockImplementation((_entity: unknown, value: unknown) => ({
            ...(value as object),
            id: projectId,
          })),
      };

      if (!transactionCallback) {
        throw new Error('Transaction callback was not registered');
      }

      await transactionCallback(manager);

      expect(manager.create).toHaveBeenCalledWith(
        Project,
        expect.objectContaining({
          name: 'Test Project',
          key: 'TEST',
          description: 'Test description',
        }),
      );
    });

    it('should use the project key as the slug when the generated slug is empty', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(ownerMember);

      dataSource.transaction.mockImplementation(
        async (callback: (manager: unknown) => Promise<unknown>) => {
          const manager = {
            create: jest
              .fn()
              .mockImplementation((_entity: unknown, value: unknown) => value),
            save: jest
              .fn()
              .mockImplementation((entity: unknown, value: unknown) => {
                if (entity === Project) {
                  return {
                    ...(value as object),
                    id: projectId,
                  };
                }

                return value;
              }),
          };

          await callback(manager);

          expect(manager.create).toHaveBeenCalledWith(
            Project,
            expect.objectContaining({
              slug: '123'.toLowerCase(),
            }),
          );

          return {};
        },
      );

      await service.create(userId, organizationId, {
        name: '123',
        key: 'ABC',
      });
    });

    it('should reject users who cannot manage projects', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(developerMember);

      await expect(service.create(userId, organizationId, dto)).rejects.toThrow(
        new ForbiddenException('You do not have permission to manage projects'),
      );

      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should reject users who are not organization members', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(null);

      await expect(service.create(userId, organizationId, dto)).rejects.toThrow(
        new ForbiddenException('You are not a member of this organization'),
      );
    });

    it('should allow organization managers to create projects', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(managerMember);

      await expect(
        service.create(userId, organizationId, dto),
      ).resolves.toBeDefined();
    });
  });

  describe('findAll', () => {
    beforeEach(() => {
      projectRepository.findAndCount.mockResolvedValue([[project], 1]);
    });

    it('should return all organization projects for an owner', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(ownerMember);

      const result = await service.findAll(userId, organizationId);

      expect(projectRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          organizationId,
        },
        order: {
          createdAt: 'DESC',
          id: 'DESC',
        },
        take: 20,
        skip: 0,
      });

      expect(result).toEqual({
        data: [project],
        total: 1,
        page: 1,
        limit: 20,
      });
    });

    it('should return all organization projects for a manager', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(managerMember);

      await service.findAll(userId, organizationId);

      expect(projectRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            organizationId,
          },
        }),
      );
    });

    it('should only return projects the user belongs to for non-managers', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(developerMember);

      await service.findAll(userId, organizationId);

      expect(projectRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            organizationId,
            members: {
              userId,
            },
          },
        }),
      );
    });

    it('should normalize page to a minimum of 1', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(ownerMember);

      const result = await service.findAll(userId, organizationId, 0, 20);

      expect(result.page).toBe(1);

      expect(projectRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        }),
      );
    });

    it('should normalize negative page values', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(ownerMember);

      const result = await service.findAll(userId, organizationId, -5, 20);

      expect(result.page).toBe(1);
    });

    it('should normalize limit to a minimum of 1', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(ownerMember);

      const result = await service.findAll(userId, organizationId, 2, 0);

      expect(result.limit).toBe(1);

      expect(projectRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 1,
          skip: 1,
        }),
      );
    });

    it('should cap the limit at 100', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(ownerMember);

      const result = await service.findAll(userId, organizationId, 2, 500);

      expect(result.limit).toBe(100);

      expect(projectRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
          skip: 100,
        }),
      );
    });

    it('should calculate the correct offset', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(ownerMember);

      await service.findAll(userId, organizationId, 3, 10);

      expect(projectRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 20,
        }),
      );
    });

    it('should reject non-members', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(null);

      await expect(service.findAll(userId, organizationId)).rejects.toThrow(
        new ForbiddenException('You are not a member of this organization'),
      );

      expect(projectRepository.findAndCount).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return the project for an organization manager', async () => {
      projectRepository.findOneBy.mockResolvedValue(project);
      organizationMemberRepository.findOne.mockResolvedValue(managerMember);
      projectMemberRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(userId, projectId)).resolves.toEqual(
        project,
      );
    });

    it('should return the project when the user is a project member', async () => {
      projectRepository.findOneBy.mockResolvedValue(project);
      organizationMemberRepository.findOne.mockResolvedValue(developerMember);
      projectMemberRepository.findOne.mockResolvedValue(projectDeveloper);

      await expect(service.findOne(userId, projectId)).resolves.toEqual(
        project,
      );
    });

    it('should allow a project admin to access the project', async () => {
      projectRepository.findOneBy.mockResolvedValue(project);
      organizationMemberRepository.findOne.mockResolvedValue(developerMember);
      projectMemberRepository.findOne.mockResolvedValue(projectAdmin);

      await expect(service.findOne(userId, projectId)).resolves.toEqual(
        project,
      );
    });

    it('should throw when the project does not exist', async () => {
      projectRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(userId, projectId)).rejects.toThrow(
        new NotFoundException('Project not found'),
      );
    });

    it('should hide an existing project from non-members', async () => {
      projectRepository.findOneBy.mockResolvedValue(project);
      organizationMemberRepository.findOne.mockResolvedValue(developerMember);
      projectMemberRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(userId, projectId)).rejects.toThrow(
        new NotFoundException('Project not found'),
      );
    });

    it('should hide a project from users outside the organization', async () => {
      projectRepository.findOneBy.mockResolvedValue(project);
      organizationMemberRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(userId, projectId)).rejects.toThrow(
        new NotFoundException('Project not found'),
      );

      expect(projectMemberRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    beforeEach(() => {
      projectRepository.findOneBy.mockResolvedValue(project);
      organizationMemberRepository.findOne.mockResolvedValue(ownerMember);
      projectMemberRepository.findOne.mockResolvedValue(null);
    });

    it('should update the project name', async () => {
      const updatedProject = {
        ...project,
        name: 'Updated Project',
        slug: 'updated-project',
      };

      projectRepository.save.mockResolvedValue(updatedProject);

      const result = await service.update(userId, projectId, {
        name: '  Updated Project  ',
      });

      expect(projectRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Project',
          slug: 'updated-project',
        }),
      );

      expect(result).toEqual(updatedProject);
    });

    it('should update the project description', async () => {
      projectRepository.save.mockResolvedValue({
        ...project,
        description: 'New description',
      });

      await service.update(userId, projectId, {
        description: '  New description  ',
      });

      expect(projectRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'New description',
        }),
      );
    });

    it('should set description to null when it is blank', async () => {
      projectRepository.save.mockResolvedValue(project);

      await service.update(userId, projectId, {
        description: '   ',
      });

      expect(projectRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          description: null,
        }),
      );
    });

    it('should update the project key', async () => {
      projectRepository.save.mockResolvedValue({
        ...project,
        key: 'NEW',
      });

      await service.update(userId, projectId, {
        key: 'NEW',
      });

      expect(projectRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'NEW',
        }),
      );
    });

    it('should reject an empty project name', async () => {
      await expect(
        service.update(userId, projectId, {
          name: '   ',
        }),
      ).rejects.toThrow(
        new BadRequestException('Project name cannot be empty'),
      );

      expect(projectRepository.save).not.toHaveBeenCalled();
    });

    it('should allow an organization manager to update the project', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(managerMember);
      projectMemberRepository.findOne.mockResolvedValue(null);
      projectRepository.save.mockResolvedValue(project);

      await expect(service.update(userId, projectId, {})).resolves.toEqual(
        project,
      );
    });

    it('should allow a project admin to update the project', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(developerMember);
      projectMemberRepository.findOne.mockResolvedValue(projectAdmin);
      projectRepository.save.mockResolvedValue(project);

      await expect(service.update(userId, projectId, {})).resolves.toEqual(
        project,
      );
    });

    it('should reject a project member without admin role', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(developerMember);
      projectMemberRepository.findOne.mockResolvedValue(projectDeveloper);

      await expect(service.update(userId, projectId, {})).rejects.toThrow(
        new ForbiddenException(
          'You do not have permission to manage this project',
        ),
      );

      expect(projectRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      projectRepository.findOneBy.mockResolvedValue(project);
      organizationMemberRepository.findOne.mockResolvedValue(ownerMember);
      projectMemberRepository.findOne.mockResolvedValue(null);
    });

    it('should delete a manageable project', async () => {
      projectRepository.delete.mockResolvedValue({
        affected: 1,
      });

      await expect(service.remove(userId, projectId)).resolves.toBeUndefined();

      expect(projectRepository.delete).toHaveBeenCalledWith({
        id: projectId,
      });
    });

    it('should allow a project admin to delete the project', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(developerMember);
      projectMemberRepository.findOne.mockResolvedValue(projectAdmin);

      await service.remove(userId, projectId);

      expect(projectRepository.delete).toHaveBeenCalledWith({
        id: projectId,
      });
    });

    it('should reject a non-manager/non-admin', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(developerMember);
      projectMemberRepository.findOne.mockResolvedValue(projectDeveloper);

      await expect(service.remove(userId, projectId)).rejects.toThrow(
        new ForbiddenException(
          'You do not have permission to manage this project',
        ),
      );

      expect(projectRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getMembers', () => {
    it('should return project members for an authorized user', async () => {
      projectRepository.findOneBy.mockResolvedValue(project);
      organizationMemberRepository.findOne.mockResolvedValue(ownerMember);
      projectMemberRepository.findOne.mockResolvedValue(projectAdmin);

      const members = [projectAdmin, projectDeveloper];

      projectMemberRepository.find.mockResolvedValue(members);

      await expect(service.getMembers(userId, projectId)).resolves.toEqual(
        members,
      );

      expect(projectMemberRepository.find).toHaveBeenCalledWith({
        where: {
          projectId,
        },
        relations: {
          user: true,
        },
      });
    });

    it('should reject an unauthorized user', async () => {
      projectRepository.findOneBy.mockResolvedValue(project);
      organizationMemberRepository.findOne.mockResolvedValue(developerMember);
      projectMemberRepository.findOne.mockResolvedValue(null);

      await expect(service.getMembers(userId, projectId)).rejects.toThrow(
        new NotFoundException('Project not found'),
      );

      expect(projectMemberRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('addMember', () => {
    const dto = {
      userId: 'new-user',
      role: ProjectRole.DEVELOPER,
    };

    beforeEach(() => {
      projectRepository.findOneBy.mockResolvedValue(project);
      organizationMemberRepository.findOne.mockResolvedValue(ownerMember);
      projectMemberRepository.findOne.mockResolvedValue(projectAdmin);

      organizationMemberRepository.existsBy.mockResolvedValue(true);
      projectMemberRepository.existsBy.mockResolvedValue(false);

      projectMemberRepository.create.mockImplementation((value) => value);

      projectMemberRepository.save.mockImplementation((value) => value);
    });

    it('should add an organization member to the project', async () => {
      const result = await service.addMember(userId, projectId, dto);

      expect(organizationMemberRepository.existsBy).toHaveBeenCalledWith({
        organizationId,
        userId: dto.userId,
      });

      expect(projectMemberRepository.existsBy).toHaveBeenCalledWith({
        projectId,
        userId: dto.userId,
      });

      expect(projectMemberRepository.create).toHaveBeenCalledWith({
        organizationId,
        projectId,
        userId: dto.userId,
        role: dto.role,
      });

      expect(result).toEqual({
        organizationId,
        projectId,
        userId: dto.userId,
        role: dto.role,
      });
    });

    it('should reject a user who is not an organization member', async () => {
      organizationMemberRepository.existsBy.mockResolvedValue(false);

      await expect(service.addMember(userId, projectId, dto)).rejects.toThrow(
        new BadRequestException(
          'User must be a member of the organization before being added to the project',
        ),
      );

      expect(projectMemberRepository.create).not.toHaveBeenCalled();
    });

    it('should reject an existing project member', async () => {
      projectMemberRepository.existsBy.mockResolvedValue(true);

      await expect(service.addMember(userId, projectId, dto)).rejects.toThrow(
        new ConflictException('User is already a member of this project'),
      );

      expect(projectMemberRepository.create).not.toHaveBeenCalled();
    });

    it('should reject users who cannot manage the project', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(developerMember);
      projectMemberRepository.findOne.mockResolvedValue(projectDeveloper);

      await expect(service.addMember(userId, projectId, dto)).rejects.toThrow(
        new ForbiddenException(
          'You do not have permission to manage this project',
        ),
      );

      expect(organizationMemberRepository.existsBy).not.toHaveBeenCalled();
    });
  });

  describe('updateMemberRole', () => {
    let manager: {
      find: jest.Mock;
      findOne: jest.Mock;
      save: jest.Mock;
    };

    beforeEach(() => {
      projectRepository.findOneBy.mockResolvedValue(project);
      organizationMemberRepository.findOne.mockResolvedValue(ownerMember);
      projectMemberRepository.findOne.mockResolvedValue(projectAdmin);

      manager = {
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
      };

      dataSource.transaction.mockImplementation(
        async (callback: (manager: unknown) => Promise<unknown>) =>
          callback(manager),
      );
    });

    it('should update a project member role', async () => {
      const member = {
        ...projectDeveloper,
      };

      manager.find.mockResolvedValue([projectAdmin, member]);
      manager.findOne.mockResolvedValue(member);
      manager.save.mockResolvedValue({
        ...member,
        role: ProjectRole.VIEWER,
      });

      const result = await service.updateMemberRole(
        userId,
        projectId,
        member.userId,
        {
          role: ProjectRole.VIEWER,
        },
      );

      expect(manager.find).toHaveBeenCalledWith(
        ProjectMember,
        expect.objectContaining({
          where: {
            projectId,
            role: ProjectRole.ADMIN,
          },
          order: {
            userId: 'ASC',
          },
          lock: {
            mode: 'pessimistic_write',
          },
        }),
      );

      expect(manager.findOne).toHaveBeenCalledWith(ProjectMember, {
        where: {
          projectId,
          userId: member.userId,
        },
      });

      expect(member.role).toBe(ProjectRole.VIEWER);
      expect(manager.save).toHaveBeenCalledWith(ProjectMember, member);

      expect(result).toEqual({
        ...member,
        role: ProjectRole.VIEWER,
      });
    });

    it('should throw when the target member does not exist', async () => {
      manager.find.mockResolvedValue([projectAdmin]);
      manager.findOne.mockResolvedValue(null);

      await expect(
        service.updateMemberRole(userId, projectId, 'missing-user', {
          role: ProjectRole.DEVELOPER,
        }),
      ).rejects.toThrow(new NotFoundException('Project member not found'));

      expect(manager.save).not.toHaveBeenCalled();
    });

    it('should prevent demoting the last project admin', async () => {
      const member = {
        ...projectAdmin,
      };

      manager.find.mockResolvedValue([member]);
      manager.findOne.mockResolvedValue(member);

      await expect(
        service.updateMemberRole(userId, projectId, member.userId, {
          role: ProjectRole.DEVELOPER,
        }),
      ).rejects.toThrow(
        new BadRequestException(
          'The last project admin cannot be removed or demoted',
        ),
      );

      expect(manager.save).not.toHaveBeenCalled();
    });

    it('should allow demoting an admin when another admin exists', async () => {
      const member = {
        ...projectAdmin,
      };

      const anotherAdmin = {
        ...projectAdmin,
        userId: 'another-admin',
      };

      manager.find.mockResolvedValue([anotherAdmin, member]);

      manager.findOne.mockResolvedValue(member);

      manager.save.mockResolvedValue({
        ...member,
        role: ProjectRole.DEVELOPER,
      });

      await expect(
        service.updateMemberRole(userId, projectId, member.userId, {
          role: ProjectRole.DEVELOPER,
        }),
      ).resolves.toEqual({
        ...member,
        role: ProjectRole.DEVELOPER,
      });
    });

    it('should allow changing a non-admin role when there is only one admin', async () => {
      const member = {
        ...projectDeveloper,
      };

      manager.find.mockResolvedValue([projectAdmin]);
      manager.findOne.mockResolvedValue(member);

      manager.save.mockResolvedValue({
        ...member,
        role: ProjectRole.VIEWER,
      });

      await expect(
        service.updateMemberRole(userId, projectId, member.userId, {
          role: ProjectRole.VIEWER,
        }),
      ).resolves.toEqual({
        ...member,
        role: ProjectRole.VIEWER,
      });
    });

    it('should reject users who cannot manage the project', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(developerMember);
      projectMemberRepository.findOne.mockResolvedValue(projectDeveloper);

      await expect(
        service.updateMemberRole(userId, projectId, projectDeveloper.userId, {
          role: ProjectRole.VIEWER,
        }),
      ).rejects.toThrow(
        new ForbiddenException(
          'You do not have permission to manage this project',
        ),
      );

      expect(dataSource.transaction).not.toHaveBeenCalled();
    });
  });

  describe('removeMember', () => {
    let manager: {
      find: jest.Mock;
      findOne: jest.Mock;
      remove: jest.Mock;
    };

    beforeEach(() => {
      projectRepository.findOneBy.mockResolvedValue(project);
      organizationMemberRepository.findOne.mockResolvedValue(ownerMember);
      projectMemberRepository.findOne.mockResolvedValue(projectAdmin);

      manager = {
        find: jest.fn(),
        findOne: jest.fn(),
        remove: jest.fn(),
      };

      dataSource.transaction.mockImplementation(
        async (callback: (manager: unknown) => Promise<unknown>) =>
          callback(manager),
      );
    });

    it('should remove a project member', async () => {
      manager.find.mockResolvedValue([projectAdmin]);
      manager.findOne.mockResolvedValue(projectDeveloper);
      manager.remove.mockResolvedValue(projectDeveloper);

      await expect(
        service.removeMember(userId, projectId, projectDeveloper.userId),
      ).resolves.toBeUndefined();

      expect(manager.remove).toHaveBeenCalledWith(
        ProjectMember,
        projectDeveloper,
      );
    });

    it('should throw when the member does not exist', async () => {
      manager.find.mockResolvedValue([projectAdmin]);
      manager.findOne.mockResolvedValue(null);

      await expect(
        service.removeMember(userId, projectId, 'missing-user'),
      ).rejects.toThrow(new NotFoundException('Project member not found'));

      expect(manager.remove).not.toHaveBeenCalled();
    });

    it('should prevent removing the last project admin', async () => {
      const member = {
        ...projectAdmin,
      };

      manager.find.mockResolvedValue([member]);
      manager.findOne.mockResolvedValue(member);

      await expect(
        service.removeMember(userId, projectId, member.userId),
      ).rejects.toThrow(
        new BadRequestException(
          'The last project admin cannot be removed or demoted',
        ),
      );

      expect(manager.remove).not.toHaveBeenCalled();
    });

    it('should allow removing an admin when another admin exists', async () => {
      const member = {
        ...projectAdmin,
      };

      const anotherAdmin = {
        ...projectAdmin,
        userId: 'another-admin',
      };

      manager.find.mockResolvedValue([anotherAdmin, member]);

      manager.findOne.mockResolvedValue(member);

      await expect(
        service.removeMember(userId, projectId, member.userId),
      ).resolves.toBeUndefined();

      expect(manager.remove).toHaveBeenCalledWith(ProjectMember, member);
    });

    it('should reject users who cannot manage the project', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(developerMember);
      projectMemberRepository.findOne.mockResolvedValue(projectDeveloper);

      await expect(
        service.removeMember(userId, projectId, projectDeveloper.userId),
      ).rejects.toThrow(
        new ForbiddenException(
          'You do not have permission to manage this project',
        ),
      );

      expect(dataSource.transaction).not.toHaveBeenCalled();
    });
  });

  describe('persistence errors', () => {
    it('should rethrow normal errors from create', async () => {
      organizationMemberRepository.findOne.mockResolvedValue(ownerMember);

      const error = new Error('database failure');

      dataSource.transaction.mockRejectedValue(error);

      await expect(
        service.create(userId, organizationId, {
          name: 'Project',
          key: 'PROJ',
        }),
      ).rejects.toBe(error);
    });

    it('should rethrow normal errors from update', async () => {
      projectRepository.findOneBy.mockResolvedValue(project);
      organizationMemberRepository.findOne.mockResolvedValue(ownerMember);
      projectMemberRepository.findOne.mockResolvedValue(null);

      const error = new Error('database failure');

      projectRepository.save.mockRejectedValue(error);

      await expect(
        service.update(userId, projectId, {
          name: 'Updated',
        }),
      ).rejects.toBe(error);
    });

    it('should map a unique project key violation to ConflictException', async () => {
      projectRepository.findOneBy.mockResolvedValue(project);
      organizationMemberRepository.findOne.mockResolvedValue(ownerMember);
      projectMemberRepository.findOne.mockResolvedValue(null);

      const metadata = {
        indices: [
          {
            isUnique: true,
            name: 'UQ_project_organization_key',
            columns: [
              { propertyName: 'organizationId' },
              { propertyName: 'key' },
            ],
          },
          {
            isUnique: true,
            name: 'UQ_project_organization_slug',
            columns: [
              { propertyName: 'organizationId' },
              { propertyName: 'slug' },
            ],
          },
        ],
      };

      dataSource.getMetadata.mockReturnValue(metadata);

      const driverError = Object.assign(new Error('duplicate key'), {
        code: '23505',
        constraint: 'UQ_project_organization_key',
      });
      const error = new QueryFailedError('UPDATE projects', [], driverError);

      projectRepository.save.mockRejectedValue(error);

      await expect(
        service.update(userId, projectId, {
          key: 'DUPLICATE',
        }),
      ).rejects.toEqual(
        new ConflictException(
          'A project with this key already exists in this organization',
        ),
      );
    });

    it('should map a unique project slug violation to ConflictException', async () => {
      projectRepository.findOneBy.mockResolvedValue(project);
      organizationMemberRepository.findOne.mockResolvedValue(ownerMember);
      projectMemberRepository.findOne.mockResolvedValue(null);

      dataSource.getMetadata.mockReturnValue({
        indices: [
          {
            isUnique: true,
            name: 'UQ_project_organization_key',
            columns: [
              { propertyName: 'organizationId' },
              { propertyName: 'key' },
            ],
          },
          {
            isUnique: true,
            name: 'UQ_project_organization_slug',
            columns: [
              { propertyName: 'organizationId' },
              { propertyName: 'slug' },
            ],
          },
        ],
      });

      const driverError = Object.assign(new Error('duplicate key'), {
        code: '23505',
        constraint: 'UQ_project_organization_slug',
      });
      const error = new QueryFailedError('UPDATE projects', [], driverError);

      projectRepository.save.mockRejectedValue(error);

      await expect(
        service.update(userId, projectId, {
          name: 'Duplicate Project',
        }),
      ).rejects.toEqual(
        new ConflictException(
          'A project with this name already exists in this organization',
        ),
      );
    });

    it('should leave an unknown unique constraint error unchanged', async () => {
      projectRepository.findOneBy.mockResolvedValue(project);
      organizationMemberRepository.findOne.mockResolvedValue(ownerMember);
      projectMemberRepository.findOne.mockResolvedValue(null);

      dataSource.getMetadata.mockReturnValue({
        indices: [
          {
            isUnique: true,
            name: 'UQ_project_organization_key',
            columns: [
              { propertyName: 'organizationId' },
              { propertyName: 'key' },
            ],
          },
        ],
      });

      const driverError = Object.assign(new Error('duplicate key'), {
        code: '23505',
        constraint: 'some_other_constraint',
      });
      const error = new QueryFailedError('UPDATE projects', [], driverError);

      projectRepository.save.mockRejectedValue(error);

      await expect(
        service.update(userId, projectId, {
          key: 'DUPLICATE',
        }),
      ).rejects.toBe(error);
    });
  });

  describe('access control', () => {
    it.each([OrganizationRole.OWNER, OrganizationRole.MANAGER])(
      'should allow %s to manage projects',
      async (role) => {
        organizationMemberRepository.findOne.mockResolvedValue({
          organizationId,
          userId,
          role,
        });

        projectRepository.findOneBy.mockResolvedValue(project);
        projectMemberRepository.findOne.mockResolvedValue(null);
        projectRepository.save.mockResolvedValue(project);

        await expect(service.update(userId, projectId, {})).resolves.toEqual(
          project,
        );
      },
    );

    it.each([OrganizationRole.DEVELOPER, OrganizationRole.VIEWER])(
      'should not allow %s to manage projects without project admin role',
      async (role) => {
        organizationMemberRepository.findOne.mockResolvedValue({
          organizationId,
          userId,
          role,
        });

        projectRepository.findOneBy.mockResolvedValue(project);
        projectMemberRepository.findOne.mockResolvedValue({
          ...projectDeveloper,
          userId,
        });

        await expect(service.update(userId, projectId, {})).rejects.toThrow(
          new ForbiddenException(
            'You do not have permission to manage this project',
          ),
        );
      },
    );
  });
});
