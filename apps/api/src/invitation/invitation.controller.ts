import {
  Body,
  Controller,
  Get,
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

  @Post('organization/:organizationId')
  invite(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @CurrentUser() user: User,
    @Body() dto: InviteMemberDto,
  ) {
    return this.invitationService.inviteMember(dto, user.id, organizationId);
  }

  @Get()
  getUserInvitations(@CurrentUser() user: User) {
    return this.invitationService.getUserInvitations(user.id);
  }

  @Post(':invitationId/accept')
  acceptInvitation(
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
    @CurrentUser() user: User,
  ) {
    return this.invitationService.acceptInvitation(invitationId, user.id);
  }

  @Post(':invitationId/decline')
  declineInvitation(
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
    @CurrentUser() user: User,
  ) {
    return this.invitationService.declineInvitation(invitationId, user.id);
  }
}
