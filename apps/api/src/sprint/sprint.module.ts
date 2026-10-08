import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Project } from '../projects/entities/project.entity';
import { SprintController } from './sprint.controller';
import { Sprint } from './entities/sprint.entity';
import { SprintService } from './sprint.service';
import { ProjectMember } from '../projects/entities/project-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sprint, Project, ProjectMember])],
  controllers: [SprintController],
  providers: [SprintService],
  exports: [SprintService],
})
export class SprintModule {}
