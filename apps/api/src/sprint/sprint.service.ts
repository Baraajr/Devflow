import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Project } from '../projects/entities/project.entity';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { ProjectRole } from '../projects/enums/project-role.enum';
import { CreateSprintDto } from './dtos/create-sprint.dto';
import { UpdateSprintDto } from './dtos/update-sprint.dto';
import { Sprint } from './entities/sprint.entity';
import { SprintStatus } from './enums/sprint-status.enum';

@Injectable()
export class SprintService {
  constructor(
    @InjectRepository(Sprint)
    private readonly sprintRepository: Repository<Sprint>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,
  ) {}

  private async getProjectMember(projectId: string, userId: string) {
    const member = await this.projectMemberRepository.findOne({
      where: { projectId, userId },
    });

    if (!member) {
      throw new NotFoundException('Project not found');
    }

    return member;
  }

  private async requireSprintManager(projectId: string, userId: string) {
    const member = await this.getProjectMember(projectId, userId);

    if (
      member.role !== ProjectRole.ADMIN &&
      member.role !== ProjectRole.DEVELOPER
    ) {
      throw new ForbiddenException(
        'You do not have permission to manage sprints',
      );
    }

    return member;
  }

  private async requireSprintAdmin(projectId: string, userId: string) {
    const member = await this.getProjectMember(projectId, userId);

    if (member.role !== ProjectRole.ADMIN) {
      throw new ForbiddenException('Only project admins can delete sprints');
    }

    return member;
  }

  async create(projectId: string, userId: string, dto: CreateSprintDto) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.requireSprintManager(projectId, userId);

    if (dto.startDate && dto.endDate && dto.startDate > dto.endDate) {
      throw new BadRequestException(
        'Start date must be before or equal to end date',
      );
    }

    const sprint = this.sprintRepository.create({
      projectId,
      name: dto.name.trim(),
      goal: dto.goal?.trim() || null,
      startDate: dto.startDate ?? null,
      endDate: dto.endDate ?? null,
      status: SprintStatus.PLANNED,
    });

    return this.sprintRepository.save(sprint);
  }

  async findAll(projectId: string, userId: string) {
    await this.getProjectMember(projectId, userId);

    return this.sprintRepository.find({
      where: { projectId },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(projectId: string, sprintId: string, userId: string) {
    await this.getProjectMember(projectId, userId);

    const sprint = await this.sprintRepository.findOne({
      where: {
        id: sprintId,
        projectId,
      },
      relations: {
        issues: true,
      },
    });

    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }

    return sprint;
  }

  async update(
    projectId: string,
    sprintId: string,
    userId: string,
    dto: UpdateSprintDto,
  ) {
    await this.requireSprintManager(projectId, userId);

    const sprint = await this.findOne(projectId, sprintId, userId);

    if (sprint.status === SprintStatus.COMPLETED) {
      throw new BadRequestException('Completed sprints cannot be updated');
    }

    if (dto.startDate && dto.endDate && dto.startDate > dto.endDate) {
      throw new BadRequestException(
        'Start date must be before or equal to end date',
      );
    }

    if (dto.name !== undefined) {
      sprint.name = dto.name.trim();
    }

    if (dto.goal !== undefined) {
      sprint.goal = dto.goal.trim() || null;
    }

    if (dto.startDate !== undefined) {
      sprint.startDate = dto.startDate;
    }

    if (dto.endDate !== undefined) {
      sprint.endDate = dto.endDate;
    }

    if (
      sprint.startDate &&
      sprint.endDate &&
      sprint.startDate > sprint.endDate
    ) {
      throw new BadRequestException(
        'Start date must be before or equal to end date',
      );
    }

    return this.sprintRepository.save(sprint);
  }

  async remove(projectId: string, sprintId: string, userId: string) {
    await this.requireSprintAdmin(projectId, userId);

    const sprint = await this.findOne(projectId, sprintId, userId);

    if (sprint.status !== SprintStatus.PLANNED) {
      throw new BadRequestException('Only planned sprints can be deleted');
    }

    await this.sprintRepository.remove(sprint);
  }

  async start(projectId: string, sprintId: string, userId: string) {
    await this.requireSprintManager(projectId, userId);

    const sprint = await this.findOne(projectId, sprintId, userId);

    if (sprint.status !== SprintStatus.PLANNED) {
      throw new BadRequestException('Only planned sprints can be started');
    }

    const activeSprint = await this.sprintRepository.findOne({
      where: {
        projectId,
        status: SprintStatus.ACTIVE,
      },
    });

    if (activeSprint) {
      throw new BadRequestException('Project already has an active sprint');
    }

    sprint.status = SprintStatus.ACTIVE;

    sprint.startDate = new Date().toISOString().split('T')[0];

    return this.sprintRepository.save(sprint);
  }

  async complete(projectId: string, sprintId: string, userId: string) {
    await this.requireSprintManager(projectId, userId);

    const sprint = await this.findOne(projectId, sprintId, userId);

    if (sprint.status !== SprintStatus.ACTIVE) {
      throw new BadRequestException('Only active sprints can be completed');
    }

    sprint.status = SprintStatus.COMPLETED;

    sprint.endDate = new Date().toISOString().split('T')[0];

    return this.sprintRepository.save(sprint);
  }
}
