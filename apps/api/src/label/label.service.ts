import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProjectMember } from '../projects/entities/project-member.entity';
import { ProjectRole } from '../projects/enums/project-role.enum';
import { CreateLabelDto } from './dtos/create-label.dto';
import { UpdateLabelDto } from './dtos/update-label.dto';
import { Label } from './entities/label.entity';

@Injectable()
export class LabelsService {
  constructor(
    @InjectRepository(Label)
    private readonly labelsRepository: Repository<Label>,

    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,
  ) {}

  private async getProjectMember(projectId: string, userId: string) {
    const member = await this.projectMemberRepository.findOne({
      where: {
        projectId,
        userId,
      },
    });

    if (!member) {
      throw new NotFoundException('Project not found');
    }

    return member;
  }

  private async requireLabelManager(projectId: string, userId: string) {
    const member = await this.getProjectMember(projectId, userId);

    if (
      member.role !== ProjectRole.ADMIN &&
      member.role !== ProjectRole.DEVELOPER
    ) {
      throw new ForbiddenException(
        'You do not have permission to manage labels',
      );
    }

    return member;
  }

  private async requireLabelAdmin(projectId: string, userId: string) {
    const member = await this.getProjectMember(projectId, userId);

    if (member.role !== ProjectRole.ADMIN) {
      throw new ForbiddenException('Only project admins can delete labels');
    }

    return member;
  }

  async create(projectId: string, userId: string, dto: CreateLabelDto) {
    await this.requireLabelManager(projectId, userId);

    const name = dto.name.trim();

    const existingLabel = await this.labelsRepository.findOne({
      where: {
        projectId,
        name,
      },
    });

    if (existingLabel) {
      throw new ConflictException('Label already exists');
    }

    const label = this.labelsRepository.create({
      projectId,
      name,
      color: dto.color,
    });

    return this.labelsRepository.save(label);
  }

  async findAll(projectId: string, userId: string) {
    await this.getProjectMember(projectId, userId);

    return this.labelsRepository.find({
      where: { projectId },
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(projectId: string, labelId: string, userId: string) {
    await this.getProjectMember(projectId, userId);

    const label = await this.labelsRepository.findOne({
      where: {
        id: labelId,
        projectId,
      },
    });

    if (!label) {
      throw new NotFoundException('Label not found');
    }

    return label;
  }

  async update(
    projectId: string,
    labelId: string,
    userId: string,
    dto: UpdateLabelDto,
  ) {
    await this.requireLabelManager(projectId, userId);

    const label = await this.findOne(projectId, labelId, userId);

    if (dto.name !== undefined) {
      const name = dto.name.trim();

      const existingLabel = await this.labelsRepository.findOne({
        where: {
          projectId,
          name,
        },
      });

      if (existingLabel && existingLabel.id !== labelId) {
        throw new ConflictException('Label already exists');
      }

      label.name = name;
    }

    if (dto.color !== undefined) {
      label.color = dto.color;
    }

    return this.labelsRepository.save(label);
  }

  async remove(projectId: string, labelId: string, userId: string) {
    await this.requireLabelAdmin(projectId, userId);

    const label = await this.findOne(projectId, labelId, userId);

    await this.labelsRepository.remove(label);
  }
}
