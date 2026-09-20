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

import { Organization } from './entities/organization.entity';
import { CreateOrgDto } from './dto/create-org.dto';
import { OrganizationService } from './organization.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

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

  @Patch(':organizationId')
  async updateOrganization(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateOrganizationDto,
  ): Promise<Organization> {
    return this.organizationService.updateOrganization(
      user.id,
      organizationId,
      dto,
    );
  }

  @Get(':organizationId/members')
  async getMembers(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @CurrentUser() user: User,
  ) {
    return this.organizationService.getOrgMembers(user.id, organizationId);
  }

  @Patch(':organizationId/members/:userId/role')
  async updateMemberRole(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.organizationService.updateMemberRole(
      user.id,
      organizationId,
      userId,
      dto.role,
    );
  }

  @Delete(':organizationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOrganization(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.organizationService.deleteOrganization(user.id, organizationId);
  }

  @Delete(':organizationId/members/me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async leaveOrganization(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.organizationService.leaveOrganization(user.id, organizationId);
  }

  @Delete(':organizationId/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.organizationService.removeMember(
      user.id,
      organizationId,
      userId,
    );
  }
}
