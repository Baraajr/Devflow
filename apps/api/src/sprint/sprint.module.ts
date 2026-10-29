import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Project } from '../projects/entities/project.entity';
import { SprintController } from './sprint.controller';
import { Sprint } from './entities/sprint.entity';
import { SprintService } from './sprint.service';
import { ProjectModule } from '../projects/project.module';

@Module({
  imports: [ProjectModule, TypeOrmModule.forFeature([Sprint, Project])],
  controllers: [SprintController],
  providers: [SprintService],
  exports: [SprintService],
})
export class SprintModule {}
