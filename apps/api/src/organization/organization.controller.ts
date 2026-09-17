import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Organization } from './entities/organization.entity';
import { CreateOrgDto } from './dto/create-org.dto';
import { OrganizationService } from './organization.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

@ApiTags('Organizations')
@UseGuards(JwtAuthGuard)
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateOrgDto,
  ): Promise<Organization> {
    return this.organizationService.create(dto, user.id);
  }

  @Get()
  async getMyOrganizations(@CurrentUser() user: User) {
    return this.organizationService.getUserOrganizations(user.id);
  }

  @Get(':organizationId')
  async getOrg(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @CurrentUser() user: User,
  ): Promise<Organization> {
    return this.organizationService.getOrganization(user.id, organizationId);
  }

  @Get(':organizationId/members')
  async getMembers(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @CurrentUser() user: User,
  ) {
    return this.organizationService.getOrgMembers(user.id, organizationId);
  }

  @Delete(':organizationId')
  async deleteOrganization(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.organizationService.deleteOrganization(user.id, organizationId);
  }

  @Delete(':organizationId/members/me')
  async leaveOrganization(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.organizationService.leaveOrganization(user.id, organizationId);
  }
}
