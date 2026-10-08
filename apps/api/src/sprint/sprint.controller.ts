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

import { CreateSprintDto } from './dtos/create-sprint.dto';
import { UpdateSprintDto } from './dtos/update-sprint.dto';
import { SprintService } from './sprint.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('projects/:projectId/sprints')
@UseGuards(JwtAuthGuard)
export class SprintController {
  constructor(private readonly sprintService: SprintService) {}

  @Post()
  create(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Body() dto: CreateSprintDto,
  ) {
    return this.sprintService.create(projectId, user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User, @Param('projectId') projectId: string) {
    return this.sprintService.findAll(projectId, user.id);
  }

  @Get(':sprintId')
  findOne(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
  ) {
    return this.sprintService.findOne(projectId, sprintId, user.id);
  }

  @Patch(':sprintId')
  update(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
    @Body() dto: UpdateSprintDto,
  ) {
    return this.sprintService.update(projectId, sprintId, user.id, dto);
  }

  @Delete(':sprintId')
  remove(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
  ) {
    return this.sprintService.remove(projectId, sprintId, user.id);
  }

  @Post(':sprintId/start')
  start(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
  ) {
    return this.sprintService.start(projectId, sprintId, user.id);
  }

  @Post(':sprintId/complete')
  complete(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Param('sprintId') sprintId: string,
  ) {
    return this.sprintService.complete(projectId, sprintId, user.id);
  }
}
