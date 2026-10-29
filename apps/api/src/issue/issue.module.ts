import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationMember } from '../organization/entities/organization-members.entity';
import { IssueController } from './issue.controller';
import { IssueService } from './issue.service';
import { Issue } from './entities/issue.entity';
import { Label } from '../label/entities/label.entity';
import { IssueLabelsService } from './issue-labels.service';
import { ProjectModule } from '../projects/project.module';

@Module({
  imports: [
    ProjectModule,
    TypeOrmModule.forFeature([Issue, OrganizationMember, Label]),
  ],
  controllers: [IssueController],
  providers: [IssueService, IssueLabelsService],
  exports: [IssueService],
})
export class IssueModule {}
