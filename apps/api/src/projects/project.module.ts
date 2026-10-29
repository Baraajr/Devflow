import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationMember } from '../organization/entities/organization-members.entity';

import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';
import { ProjectAccessService } from './project-access.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectMember, OrganizationMember]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectAccessService],
  exports: [ProjectService, ProjectAccessService],
})
export class ProjectModule {}
