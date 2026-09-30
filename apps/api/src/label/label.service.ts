import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Label } from './entities/label.entity';
import { CreateLabelDto } from './dtos/create-label.dto';
import { UpdateLabelDto } from './dtos/update-label.dto';

@Injectable()
export class LabelsService {
  constructor(
    @InjectRepository(Label)
    private readonly labelsRepository: Repository<Label>,
  ) {}

  async create(projectId: string, dto: CreateLabelDto) {
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

  async findAll(projectId: string) {
    return this.labelsRepository.find({
      where: { projectId },
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(projectId: string, labelId: string) {
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

  async update(projectId: string, labelId: string, dto: UpdateLabelDto) {
    const label = await this.findOne(projectId, labelId);

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

  async remove(projectId: string, labelId: string) {
    const label = await this.findOne(projectId, labelId);

    await this.labelsRepository.remove(label);
  }
}
