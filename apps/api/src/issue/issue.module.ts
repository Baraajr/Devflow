import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationMember } from '../organization/entities/organization-members.entity';
import { IssueController } from './issue.controller';
import { IssueService } from './issue.service';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { Issue } from './entities/issue.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Issue, ProjectMember, OrganizationMember]),
  ],
  controllers: [IssueController],
  providers: [IssueService],
  exports: [IssueService],
})
export class IssueModule {}
