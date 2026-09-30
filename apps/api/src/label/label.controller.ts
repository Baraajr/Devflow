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

@Controller('projects/:projectId/labels')
@UseGuards(JwtAuthGuard)
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Post()
  create(@Param('projectId') projectId: string, @Body() dto: CreateLabelDto) {
    return this.labelsService.create(projectId, dto);
  }

  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.labelsService.findAll(projectId);
  }

  @Get(':labelId')
  findOne(
    @Param('projectId') projectId: string,
    @Param('labelId') labelId: string,
  ) {
    return this.labelsService.findOne(projectId, labelId);
  }

  @Patch(':labelId')
  update(
    @Param('projectId') projectId: string,
    @Param('labelId') labelId: string,
    @Body() dto: UpdateLabelDto,
  ) {
    return this.labelsService.update(projectId, labelId, dto);
  }

  @Delete(':labelId')
  remove(
    @Param('projectId') projectId: string,
    @Param('labelId') labelId: string,
  ) {
    return this.labelsService.remove(projectId, labelId);
  }
}
