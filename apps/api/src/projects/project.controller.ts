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

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

import { CreateProjectDto } from './dtos/create-project.dto';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { ProjectService } from './project.service';
import { User } from '../users/entities/user.entity';
import { AddProjectMemberDto } from './dtos/add-project-member.dto';
import { UpdateProjectMemberRoleDto } from './dtos/update-project-member-role.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('organizations/:organizationId/projects')
  create(
    @CurrentUser() user: User,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectService.create(user.id, organizationId, dto);
  }

  @Get('organizations/:organizationId/projects')
  findAll(
    @CurrentUser() user: User,

    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    return this.projectService.findAll(user.id, organizationId);
  }

  @Get('projects/:projectId')
  findOne(
    @CurrentUser() user: User,

    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    return this.projectService.findOne(user.id, projectId);
  }

  @Patch('projects/:projectId')
  update(
    @CurrentUser() user: User,

    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectService.update(user.id, projectId, dto);
  }

  @Delete('projects/:projectId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: User,

    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    return this.projectService.remove(user.id, projectId);
  }

  @Get('projects/:projectId/members')
  getMembers(
    @CurrentUser() user: User,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    return this.projectService.getMembers(user.id, projectId);
  }

  @Post('projects/:projectId/members')
  addMember(
    @CurrentUser() user: User,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: AddProjectMemberDto,
  ) {
    return this.projectService.addMember(user.id, projectId, dto);
  }

  @Patch('projects/:projectId/members/:memberUserId')
  updateMemberRole(
    @CurrentUser() user: User,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('memberUserId', ParseUUIDPipe) memberUserId: string,
    @Body() dto: UpdateProjectMemberRoleDto,
  ) {
    return this.projectService.updateMemberRole(
      user.id,
      projectId,
      memberUserId,
      dto,
    );
  }

  @Delete('projects/:projectId/members/:memberUserId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @CurrentUser() user: User,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('memberUserId', ParseUUIDPipe) memberUserId: string,
  ) {
    return this.projectService.removeMember(user.id, projectId, memberUserId);
  }
}
