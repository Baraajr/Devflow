import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Issue } from './entities/issue.entity';
import { Label } from '../label/entities/label.entity';

@Injectable()
export class IssueLabelsService {
  constructor(
    @InjectRepository(Issue)
    private readonly issuesRepository: Repository<Issue>,

    @InjectRepository(Label)
    private readonly labelsRepository: Repository<Label>,
  ) {}

  async addLabel(projectId: string, issueId: string, labelId: string) {
    const issue = await this.issuesRepository.findOne({
      where: {
        id: issueId,
        projectId,
      },
      relations: {
        labels: true,
      },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    const label = await this.labelsRepository.findOne({
      where: {
        id: labelId,
        projectId,
      },
    });

    if (!label) {
      throw new NotFoundException('Label not found');
    }

    const alreadyAssigned = issue.labels.some(
      (issueLabel) => issueLabel.id === labelId,
    );

    if (alreadyAssigned) {
      throw new BadRequestException('Label is already assigned to this issue');
    }

    issue.labels.push(label);

    await this.issuesRepository.save(issue);

    return label;
  }

  async removeLabel(projectId: string, issueId: string, labelId: string) {
    const issue = await this.issuesRepository.findOne({
      where: {
        id: issueId,
        projectId,
      },
      relations: {
        labels: true,
      },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    const labelIndex = issue.labels.findIndex(
      (issueLabel) => issueLabel.id === labelId,
    );

    if (labelIndex === -1) {
      throw new NotFoundException('Label is not assigned to this issue');
    }

    issue.labels.splice(labelIndex, 1);

    await this.issuesRepository.save(issue);
  }
}
