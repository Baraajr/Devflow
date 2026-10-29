import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommentsController } from './comment.controller';
import { CommentsService } from './comment.service';

import { IssueComment } from './entities/comment.entity';
import { IssueModule } from '../issue/issue.module';
import { ProjectModule } from '../projects/project.module';

@Module({
  imports: [
    ProjectModule,
    IssueModule,
    TypeOrmModule.forFeature([IssueComment]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentModule {}
