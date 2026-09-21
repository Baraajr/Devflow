import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { InvitationService } from './invitation.service';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { InviteMemberDto } from './dtos/invite-member.dto';
import { User } from '../users/entities/user.entity';

@ApiTags('Invitations')
@UseGuards(JwtAuthGuard)
@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  // Invite a user to an organization
  @Post('organization/:organizationId')
  invite(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @CurrentUser() user: User,
    @Body() dto: InviteMemberDto,
  ) {
    return this.invitationService.inviteMember(dto, user.id, organizationId);
  }

  // Get invitations received by the current user
  @Get()
  getUserInvitations(@CurrentUser() user: User) {
    return this.invitationService.getUserInvitations(user.id);
  }

  // Get invitations sent for an organization
  @Get('organization/:organizationId')
  getOrganizationInvitations(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @CurrentUser() user: User,
  ) {
    return this.invitationService.getOrganizationInvitations(
      organizationId,
      user.id,
    );
  }

  // Get a specific invitation
  @Get(':invitationId')
  getInvitation(
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
    @CurrentUser() user: User,
  ) {
    return this.invitationService.getInvitation(invitationId, user.id);
  }

  // Accept invitation
  @Post(':invitationId/accept')
  acceptInvitation(
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
    @CurrentUser() user: User,
  ) {
    return this.invitationService.acceptInvitation(invitationId, user.id);
  }

  // Decline invitation
  @Post(':invitationId/decline')
  declineInvitation(
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
    @CurrentUser() user: User,
  ) {
    return this.invitationService.declineInvitation(invitationId, user.id);
  }

  // Revoke/cancel invitation
  @Delete(':invitationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  revokeInvitation(
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
    @CurrentUser() user: User,
  ) {
    return this.invitationService.revokeInvitation(invitationId, user.id);
  }
}
