import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  QueryFailedError,
  Repository,
} from 'typeorm';

import { OrganizationMember } from '../organization/entities/organization-members.entity';
import { OrganizationRole } from '../organization/enums/organization-role.enum';

import { AddProjectMemberDto } from './dtos/add-project-member.dto';
import { CreateProjectDto } from './dtos/create-project.dto';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { UpdateProjectMemberRoleDto } from './dtos/update-project-member-role.dto';

import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';

import { ProjectRole } from './enums/project-role.enum';

const PG_UNIQUE_VIOLATION = '23505';
const MAX_PAGE_SIZE = 100;

const ORG_ROLES_WITH_PROJECT_MANAGEMENT: readonly OrganizationRole[] = [
  OrganizationRole.OWNER,
  OrganizationRole.MANAGER,
];

interface ProjectAccess {
  project: Project;
  orgMember: OrganizationMember;
  projectMember: ProjectMember | null;
}

@Injectable()
export class ProjectService {
  private keyIndexName?: string;
  private slugIndexName?: string;

  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,

    @InjectRepository(OrganizationMember)
    private readonly organizationMemberRepository: Repository<OrganizationMember>,

    private readonly dataSource: DataSource,
  ) {}

  // ---------- projects ----------

  async create(
    userId: string,
    organizationId: string,
    dto: CreateProjectDto,
  ): Promise<Project> {
    const orgMember = await this.getOrgMemberOrThrow(userId, organizationId);

    this.assertCanManageProjects(orgMember.role);

    const name = dto.name.trim();
    const key = dto.key.trim().toUpperCase();
    const slug = this.generateSlug(name) || key.toLowerCase();

    try {
      return await this.dataSource.transaction(async (manager) => {
        const project = manager.create(Project, {
          organizationId,
          name,
          key,
          slug,
          description: dto.description?.trim() || null,
        });

        const savedProject = await manager.save(Project, project);

        const projectMember = manager.create(ProjectMember, {
          organizationId,
          projectId: savedProject.id,
          userId,
          role: ProjectRole.ADMIN,
        });

        await manager.save(ProjectMember, projectMember);

        return savedProject;
      });
    } catch (error) {
      throw this.mapPersistenceError(error);
    }
  }

  async findAll(
    userId: string,
    organizationId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: Project[];
    total: number;
    page: number;
    limit: number;
  }> {
    const orgMember = await this.getOrgMemberOrThrow(userId, organizationId);

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_SIZE);

    // Organization owners/managers see every project in the organization.
    // Other members only see projects they were explicitly added to.
    const [data, total] = await this.projectRepository.findAndCount({
      where: this.canManageProjects(orgMember.role)
        ? { organizationId }
        : { organizationId, members: { userId } },
      order: { createdAt: 'DESC', id: 'DESC' },
      take: safeLimit,
      skip: (safePage - 1) * safeLimit,
    });

    return {
      data,
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async findOne(userId: string, projectId: string): Promise<Project> {
    const { project } = await this.getProjectAccess(userId, projectId);

    return project;
  }

  async update(
    userId: string,
    projectId: string,
    dto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.getManageableProject(userId, projectId);

    if (dto.name !== undefined) {
      const name = dto.name.trim();

      if (!name) {
        throw new BadRequestException('Project name cannot be empty');
      }

      project.name = name;
      project.slug = this.generateSlug(name) || project.key.toLowerCase();
    }

    if (dto.description !== undefined) {
      project.description = dto.description?.trim() || null;
    }

    if (dto.key !== undefined) {
      project.key = dto.key.trim();
    }

    try {
      return await this.projectRepository.save(project);
    } catch (error) {
      throw this.mapPersistenceError(error);
    }
  }

  async remove(userId: string, projectId: string): Promise<void> {
    const project = await this.getManageableProject(userId, projectId);

    await this.projectRepository.delete({ id: project.id });
  }

  // ---------- project members ----------

  async getMembers(userId: string, projectId: string) {
    // Ensure the user has access to view this project's details/members
    await this.getProjectAccess(userId, projectId);

    const projectMembers = await this.projectMemberRepository.find({
      where: { projectId },
      relations: {
        user: true,
      },
    });

    return projectMembers;
  }

  async addMember(
    userId: string,
    projectId: string,
    dto: AddProjectMemberDto,
  ): Promise<ProjectMember> {
    const project = await this.getManageableProject(userId, projectId);

    const isOrgMember = await this.organizationMemberRepository.existsBy({
      organizationId: project.organizationId,
      userId: dto.userId,
    });

    if (!isOrgMember) {
      throw new BadRequestException(
        'User must be a member of the organization before being added to the project',
      );
    }

    const alreadyMember = await this.projectMemberRepository.existsBy({
      projectId: project.id,
      userId: dto.userId,
    });

    if (alreadyMember) {
      throw new ConflictException('User is already a member of this project');
    }

    const member = this.projectMemberRepository.create({
      organizationId: project.organizationId,
      projectId: project.id,
      userId: dto.userId,
      role: dto.role,
    });

    try {
      return await this.projectMemberRepository.save(member);
    } catch (error) {
      // Concurrent request added the same user between the check and the insert.
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('User is already a member of this project');
      }

      throw this.mapPersistenceError(error);
    }
  }

  async updateMemberRole(
    userId: string,
    projectId: string,
    memberUserId: string,
    dto: UpdateProjectMemberRoleDto,
  ): Promise<ProjectMember> {
    const project = await this.getManageableProject(userId, projectId);

    return this.dataSource.transaction(async (manager) => {
      // Admin rows are locked first (in a stable order) so concurrent
      // demotions/removals cannot both pass the "last admin" check.
      const adminCount = await this.lockAndCountAdmins(manager, project.id);

      const member = await manager.findOne(ProjectMember, {
        where: { projectId: project.id, userId: memberUserId },
      });

      if (!member) {
        throw new NotFoundException('Project member not found');
      }

      if (
        member.role === ProjectRole.ADMIN &&
        dto.role !== ProjectRole.ADMIN &&
        adminCount <= 1
      ) {
        throw new BadRequestException(
          'The last project admin cannot be removed or demoted',
        );
      }

      member.role = dto.role;

      return manager.save(ProjectMember, member);
    });
  }

  async removeMember(
    userId: string,
    projectId: string,
    memberUserId: string,
  ): Promise<void> {
    const project = await this.getManageableProject(userId, projectId);

    await this.dataSource.transaction(async (manager) => {
      const adminCount = await this.lockAndCountAdmins(manager, project.id);

      const member = await manager.findOne(ProjectMember, {
        where: { projectId: project.id, userId: memberUserId },
      });

      if (!member) {
        throw new NotFoundException('Project member not found');
      }

      if (member.role === ProjectRole.ADMIN && adminCount <= 1) {
        throw new BadRequestException(
          'The last project admin cannot be removed or demoted',
        );
      }

      await manager.remove(ProjectMember, member);
    });
  }

  // ---------- authorization ----------

  private async getOrgMemberOrThrow(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationMember> {
    const member = await this.organizationMemberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    return member;
  }

  /**
   * Loads a project the user is allowed to see.
   * Missing project, non-org-member and non-project-member all return the
   * same 404 so project IDs cannot be probed.
   */
  private async getProjectAccess(
    userId: string,
    projectId: string,
  ): Promise<ProjectAccess> {
    const project = await this.projectRepository.findOneBy({ id: projectId });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const orgMember = await this.organizationMemberRepository.findOne({
      where: { organizationId: project.organizationId, userId },
    });

    if (!orgMember) {
      throw new NotFoundException('Project not found');
    }

    const projectMember = await this.projectMemberRepository.findOne({
      where: { projectId: project.id, userId },
    });

    // Organization owners/managers can access every project in the org.
    if (!projectMember && !this.canManageProjects(orgMember.role)) {
      throw new NotFoundException('Project not found');
    }

    return { project, orgMember, projectMember };
  }

  /**
   * Loads a project the user is allowed to manage: org owners/managers,
   * or admins of this specific project.
   */
  private async getManageableProject(
    userId: string,
    projectId: string,
  ): Promise<Project> {
    const { project, orgMember, projectMember } = await this.getProjectAccess(
      userId,
      projectId,
    );

    if (
      this.canManageProjects(orgMember.role) ||
      projectMember?.role === ProjectRole.ADMIN
    ) {
      return project;
    }

    throw new ForbiddenException(
      'You do not have permission to manage this project',
    );
  }

  private assertCanManageProjects(role: OrganizationRole): void {
    if (!this.canManageProjects(role)) {
      throw new ForbiddenException(
        'You do not have permission to manage projects',
      );
    }
  }

  private canManageProjects(role: OrganizationRole): boolean {
    return ORG_ROLES_WITH_PROJECT_MANAGEMENT.includes(role);
  }

  private async lockAndCountAdmins(
    manager: EntityManager,
    projectId: string,
  ): Promise<number> {
    const admins = await manager.find(ProjectMember, {
      where: { projectId, role: ProjectRole.ADMIN },
      order: { userId: 'ASC' },
      lock: { mode: 'pessimistic_write' },
    });

    return admins.length;
  }

  // ---------- persistence ----------

  private isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string })?.code === PG_UNIQUE_VIOLATION
    );
  }

  private mapPersistenceError(error: unknown): Error {
    if (!(error instanceof QueryFailedError)) {
      return error instanceof Error
        ? error
        : new Error('Database operation failed');
    }

    const driverError = error.driverError as {
      code?: string;
      constraint?: string;
    };

    if (driverError?.code !== PG_UNIQUE_VIOLATION) {
      return error;
    }

    this.resolveIndexNames();

    if (driverError.constraint === this.keyIndexName) {
      return new ConflictException(
        'A project with this key already exists in this organization',
      );
    }

    if (driverError.constraint === this.slugIndexName) {
      return new ConflictException(
        'A project with this name already exists in this organization',
      );
    }

    return error;
  }

  /**
   * Reads the auto-generated unique index names from TypeORM metadata so key
   * conflicts and slug conflicts can be told apart without touching the entity.
   */
  private resolveIndexNames(): void {
    if (this.keyIndexName && this.slugIndexName) {
      return;
    }

    const uniqueIndices = this.dataSource
      .getMetadata(Project)
      .indices.filter((index) => index.isUnique);

    const findCompositeIndex = (properties: string[]): string | undefined => {
      const expected = [...properties].sort();

      return uniqueIndices.find((index) => {
        const actual = index.columns
          .map((column) => column.propertyName)
          .sort();

        return (
          actual.length === expected.length &&
          actual.every((property, position) => property === expected[position])
        );
      })?.name;
    };

    this.keyIndexName = findCompositeIndex(['organizationId', 'key']);
    this.slugIndexName = findCompositeIndex(['organizationId', 'slug']);
  }

  // ---------- helpers ----------

  private generateSlug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
