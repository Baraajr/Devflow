import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CommentsService } from './comment.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('projects/:projectId/issues/:issueId/comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(
    @Param('projectId') projectId: string,
    @Param('issueId') issueId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(projectId, issueId, user.id, dto);
  }

  @Get()
  findAll(
    @Param('projectId') projectId: string,
    @Param('issueId') issueId: string,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.findAll(projectId, issueId, user.id);
  }

  @Get(':commentId')
  findOne(
    @Param('projectId') projectId: string,
    @Param('issueId') issueId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.findOne(projectId, issueId, commentId, user.id);
  }

  @Patch(':commentId')
  update(
    @Param('projectId') projectId: string,
    @Param('issueId') issueId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(
      projectId,
      issueId,
      commentId,
      user.id,
      dto,
    );
  }

  @Delete(':commentId')
  remove(
    @Param('projectId') projectId: string,
    @Param('issueId') issueId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.remove(projectId, issueId, commentId, user.id);
  }
}
