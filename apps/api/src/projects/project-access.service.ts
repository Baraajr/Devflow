import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectMember } from './entities/project-member.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectAccessService {
  constructor(
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,
  ) {}

  async ensureProjectMember(projectId: string, userId: string) {
    const member = await this.projectMemberRepository.findOne({
      where: { projectId, userId },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this project');
    }

    return member;
  }
}
