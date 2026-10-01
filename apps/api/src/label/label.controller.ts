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

import { CreateLabelDto } from './dtos/create-label.dto';
import { UpdateLabelDto } from './dtos/update-label.dto';
import { LabelsService } from './label.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('projects/:projectId/labels')
@UseGuards(JwtAuthGuard)
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Post()
  create(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Body() dto: CreateLabelDto,
  ) {
    return this.labelsService.create(projectId, user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User, @Param('projectId') projectId: string) {
    return this.labelsService.findAll(projectId, user.id);
  }

  @Get(':labelId')
  findOne(
    @CurrentUser() user: User,

    @Param('projectId') projectId: string,
    @Param('labelId') labelId: string,
  ) {
    return this.labelsService.findOne(projectId, labelId, user.id);
  }

  @Patch(':labelId')
  update(
    @CurrentUser() user: User,

    @Param('projectId') projectId: string,
    @Param('labelId') labelId: string,
    @Body() dto: UpdateLabelDto,
  ) {
    return this.labelsService.update(projectId, labelId, user.id, dto);
  }

  @Delete(':labelId')
  remove(
    @CurrentUser() user: User,

    @Param('projectId') projectId: string,
    @Param('labelId') labelId: string,
  ) {
    return this.labelsService.remove(projectId, labelId, user.id);
  }
}
