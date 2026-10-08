import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Issue } from './entities/issue.entity';
import { CreateIssueDto } from './dtos/create-issue.dto';
import { UpdateIssueDto } from './dtos/update-issue.dto';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { ProjectRole } from '../projects/enums/project-role.enum';
import { IssuePriority } from './enums/Issue-priority.enum';
import { IssueStatus } from './enums/Issue-status.enum';
import { ApiFeatures } from '../common/utils/api-features';
import type { QueryString } from '../common/types/types';
import { IssueListResponse } from './types/issues';

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue)
    private readonly issueRepository: Repository<Issue>,

    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,
  ) {}

  async create(
    projectId: string,
    userId: string,
    dto: CreateIssueDto,
  ): Promise<Issue> {
    const member = await this.getProjectMember(projectId, userId);

    if (
      member.role !== ProjectRole.ADMIN &&
      member.role !== ProjectRole.DEVELOPER
    ) {
      throw new ForbiddenException(
        'You do not have permission to create issues',
      );
    }

    const issueNumber = await this.getNextIssueNumber(projectId);

    const issue = this.issueRepository.create({
      projectId,
      reporterId: userId,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      issueType: dto.issueType,
      priority: dto.priority ?? IssuePriority.MEDIUM,
      status: IssueStatus.TODO,
      parentIssueId: dto.parentIssueId ?? null,
      sprintId: dto.parentIssueId ?? null,
      issueNumber,
    });

    return this.issueRepository.save(issue);
  }

  async findAll(
    projectId: string,
    userId: string,
    queryString: QueryString,
  ): Promise<IssueListResponse> {
    await this.getProjectMember(projectId, userId);

    const query = this.issueRepository
      .createQueryBuilder('issue')
      .leftJoinAndSelect('issue.reporter', 'reporter')
      .leftJoinAndSelect('issue.assignee', 'assignee')
      .leftJoinAndSelect('issue.labels', 'labels')
      .where('issue.projectId = :projectId', { projectId });

    const count = await query.getCount();

    const features = new ApiFeatures(query, queryString)
      .filter()
      .sort()
      .paginate(count);

    const issues = await features.getQuery().getMany();

    return {
      data: issues,
      pagination: features.getPaginationResult()!,
    };
  }

  async findOne(
    projectId: string,
    issueId: string,
    userId: string,
  ): Promise<Issue> {
    await this.getProjectMember(projectId, userId);

    const issue = await this.issueRepository.findOne({
      where: {
        id: issueId,
        projectId,
      },
      relations: {
        reporter: true,
        assignee: true,
        parentIssue: true,
        labels: true,
      },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    return issue;
  }

  async update(
    projectId: string,
    issueId: string,
    userId: string,
    dto: UpdateIssueDto,
  ): Promise<Issue> {
    const member = await this.getProjectMember(projectId, userId);

    if (
      member.role !== ProjectRole.ADMIN &&
      member.role !== ProjectRole.DEVELOPER
    ) {
      throw new ForbiddenException(
        'You do not have permission to update issues',
      );
    }

    const issue = await this.issueRepository.findOne({
      where: {
        id: issueId,
        projectId,
      },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    if (dto.title !== undefined) {
      issue.title = dto.title.trim();
    }

    if (dto.description !== undefined) {
      issue.description = dto.description.trim() || null;
    }

    if (dto.issueType !== undefined) {
      issue.issueType = dto.issueType;
    }

    if (dto.status !== undefined) {
      issue.status = dto.status;
    }

    if (dto.priority !== undefined) {
      issue.priority = dto.priority;
    }

    if (dto.parentIssueId !== undefined) {
      if (dto.parentIssueId !== null) {
        await this.ensureIssueBelongsToProject(projectId, dto.parentIssueId);
      }

      issue.parentIssueId = dto.parentIssueId;
    }

    return this.issueRepository.save(issue);
  }

  async remove(
    projectId: string,
    issueId: string,
    userId: string,
  ): Promise<void> {
    const member = await this.getProjectMember(projectId, userId);

    if (member.role !== ProjectRole.ADMIN) {
      throw new ForbiddenException('Only project admins can delete issues');
    }

    const issue = await this.issueRepository.findOne({
      where: {
        id: issueId,
        projectId,
      },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    await this.issueRepository.remove(issue);
  }

  async assign(
    projectId: string,
    issueId: string,
    userId: string,
    assigneeId: string,
  ): Promise<Issue> {
    const member = await this.getProjectMember(projectId, userId);

    if (member.role !== ProjectRole.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to assign issues',
      );
    }

    const issue = await this.issueRepository.findOne({
      where: {
        id: issueId,
        projectId,
      },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    const assignee = await this.ensureProjectMember(projectId, assigneeId);

    if (assignee.role !== ProjectRole.DEVELOPER) {
      throw new BadRequestException('Issue can be assigned only to developers');
    }

    issue.assigneeId = assigneeId;

    return this.issueRepository.save(issue);
  }

  private async getProjectMember(
    projectId: string,
    userId: string,
  ): Promise<ProjectMember> {
    const member = await this.projectMemberRepository.findOne({
      where: {
        projectId,
        userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this project');
    }

    return member;
  }

  private async ensureProjectMember(
    projectId: string,
    userId: string,
  ): Promise<ProjectMember> {
    const member = await this.projectMemberRepository.findOne({
      where: {
        projectId,
        userId,
      },
    });

    if (!member) {
      throw new NotFoundException('Assignee is not a member of this project');
    }
    return member;
  }

  private async ensureIssueBelongsToProject(
    projectId: string,
    issueId: string,
  ): Promise<void> {
    const issue = await this.issueRepository.findOne({
      where: {
        id: issueId,
        projectId,
      },
      select: {
        id: true,
      },
    });

    if (!issue) {
      throw new NotFoundException('Parent issue not found in this project');
    }
  }

  private async getNextIssueNumber(projectId: string): Promise<number> {
    const result = await this.issueRepository
      .createQueryBuilder('issue')
      .select('MAX(issue.issueNumber)', 'max')
      .where('issue.projectId = :projectId', { projectId })
      .getRawOne<{ max: string | null }>();

    return Number(result?.max ?? 0) + 1;
  }
}
