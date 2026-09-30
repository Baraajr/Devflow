import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IssueService } from './issue.service';
import { IssueLabelsService } from './issue-labels.service';

import { CreateIssueDto } from './dtos/create-issue.dto';
import { UpdateIssueDto } from './dtos/update-issue.dto';
import { AssignIssueDto } from './dtos/assign-issue.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Issues')
@Controller('projects/:projectId/issues')
@UseGuards(JwtAuthGuard)
export class IssueController {
  constructor(
    private readonly issueService: IssueService,
    private readonly issueLabelsService: IssueLabelsService,
  ) {}

  @Post()
  create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateIssueDto,
  ) {
    return this.issueService.create(projectId, user.id, dto);
  }

  @Get()
  findAll(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @CurrentUser() user: User,
  ) {
    return this.issueService.findAll(projectId, user.id);
  }

  @Get(':issueId')
  findOne(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('issueId', ParseUUIDPipe) issueId: string,
    @CurrentUser() user: User,
  ) {
    return this.issueService.findOne(projectId, issueId, user.id);
  }

  @Patch(':issueId')
  update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('issueId', ParseUUIDPipe) issueId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateIssueDto,
  ) {
    return this.issueService.update(projectId, issueId, user.id, dto);
  }

  @Patch(':issueId/assign')
  assign(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('issueId', ParseUUIDPipe) issueId: string,
    @CurrentUser() user: User,
    @Body() dto: AssignIssueDto,
  ) {
    return this.issueService.assign(
      projectId,
      issueId,
      user.id,
      dto.assigneeId,
    );
  }

  @Post(':issueId/labels/:labelId')
  addLabel(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('issueId', ParseUUIDPipe) issueId: string,
    @Param('labelId', ParseUUIDPipe) labelId: string,
  ) {
    return this.issueLabelsService.addLabel(projectId, issueId, labelId);
  }

  @Delete(':issueId/labels/:labelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeLabel(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('issueId', ParseUUIDPipe) issueId: string,
    @Param('labelId', ParseUUIDPipe) labelId: string,
  ): Promise<void> {
    return this.issueLabelsService.removeLabel(projectId, issueId, labelId);
  }

  @Delete(':issueId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('issueId', ParseUUIDPipe) issueId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.issueService.remove(projectId, issueId, user.id);
  }
}
