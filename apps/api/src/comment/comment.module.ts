import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommentsController } from './comment.controller';
import { CommentsService } from './comment.service';

import { ProjectMember } from '../projects/entities/project-member.entity';
import { IssueComment } from './entities/comment.entity';
import { IssueModule } from '../issue/issue.module';

@Module({
  imports: [
    IssueModule,
    TypeOrmModule.forFeature([IssueComment, ProjectMember]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentModule {}
