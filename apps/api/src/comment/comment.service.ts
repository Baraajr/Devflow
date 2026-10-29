import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProjectRole } from '../projects/enums/project-role.enum';
import { IssueService } from '../issue/issue.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { IssueComment } from './entities/comment.entity';
import { ProjectAccessService } from '../projects/project-access.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(IssueComment)
    private readonly commentsRepository: Repository<IssueComment>,

    private readonly issueService: IssueService,

    private readonly projectAccessService: ProjectAccessService,
  ) {}

  async create(
    projectId: string,
    issueId: string,
    userId: string,
    dto: CreateCommentDto,
  ) {
    await this.issueService.findOne(projectId, issueId, userId);

    const content = dto.content.trim();

    if (!content) {
      throw new BadRequestException('Comment cannot be empty');
    }

    const comment = this.commentsRepository.create({
      issueId,
      authorId: userId,
      content,
    });

    return this.commentsRepository.save(comment);
  }

  async findAll(projectId: string, issueId: string, userId: string) {
    await this.issueService.findOne(projectId, issueId, userId);

    return this.commentsRepository.find({
      where: {
        issueId,
      },
      relations: {
        author: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async findOne(
    projectId: string,
    issueId: string,
    commentId: string,
    userId: string,
  ) {
    await this.issueService.findOne(projectId, issueId, userId);

    const comment = await this.commentsRepository.findOne({
      where: {
        id: commentId,
        issueId,
      },
      relations: {
        author: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async update(
    projectId: string,
    issueId: string,
    commentId: string,
    userId: string,
    dto: UpdateCommentDto,
  ) {
    const member = await this.projectAccessService.ensureProjectMember(
      projectId,
      userId,
    );

    await this.issueService.findOne(projectId, issueId, userId);

    const comment = await this.commentsRepository.findOne({
      where: {
        id: commentId,
        issueId,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isAuthor = comment.authorId === userId;
    const isAdmin = member.role === ProjectRole.ADMIN;

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    const content = dto.content.trim();

    if (!content) {
      throw new BadRequestException('Comment cannot be empty');
    }

    comment.content = content;

    return this.commentsRepository.save(comment);
  }

  async remove(
    projectId: string,
    issueId: string,
    commentId: string,
    userId: string,
  ) {
    const member = await this.projectAccessService.ensureProjectMember(
      projectId,
      userId,
    );

    await this.issueService.findOne(projectId, issueId, userId);

    const comment = await this.commentsRepository.findOne({
      where: {
        id: commentId,
        issueId,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isAuthor = comment.authorId === userId;
    const isAdmin = member.role === ProjectRole.ADMIN;

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentsRepository.remove(comment);

    return {
      message: 'Comment deleted successfully',
    };
  }
}
