import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { OrganizationInvitation } from './entities/organization-invitation.entity';
import { InvitationStatus } from './enums/invitation-status.enum';
import { OrganizationMember } from '../organization/entities/organization-members.entity';
import { OrganizationRole } from '../organization/enums/organization-role.enum';
import { InviteMemberDto } from './dtos/invite-member.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(OrganizationInvitation)
    private readonly invitationRepository: Repository<OrganizationInvitation>,

    @InjectRepository(OrganizationMember)
    private readonly organizationMemberRepository: Repository<OrganizationMember>,

    private readonly usersService: UsersService,

    private readonly dataSource: DataSource,

    private readonly configService: ConfigService,
  ) {}

  async inviteMember(
    dto: InviteMemberDto,
    userId: string,
    organizationId: string,
  ) {
    // 1. Verify that the requester is an organization owner
    const membership = await this.organizationMemberRepository.findOne({
      where: {
        organizationId,
        userId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    if (membership.role !== OrganizationRole.OWNER) {
      throw new ForbiddenException(
        'You do not have permission to invite members',
      );
    }

    // 2. Find the user being invited
    const invitedUser = await this.usersService.findByEmail(
      dto.invitedUserEmail,
    );

    if (!invitedUser) {
      throw new NotFoundException('User with this email does not exist');
    }

    // 3. Prevent inviting an existing member
    const existingMember = await this.organizationMemberRepository.findOne({
      where: {
        organizationId,
        userId: invitedUser.id,
      },
    });

    if (existingMember) {
      throw new ConflictException(
        'User is already a member of this organization',
      );
    }

    // 4. Prevent duplicate pending invitations
    const pendingInvitation = await this.invitationRepository.findOne({
      where: {
        organizationId,
        invitedUserId: invitedUser.id,
        status: InvitationStatus.PENDING,
      },
    });

    if (pendingInvitation) {
      throw new ConflictException(
        'A pending invitation already exists for this user',
      );
    }

    // 5. Create invitation
    const invitationExpiresInSeconds = this.configService.get<number>(
      'auth.invitationExpiresInSeconds',
    );

    if (!invitationExpiresInSeconds) {
      throw new Error('Invitation expiration configuration is missing');
    }

    const invitation = this.invitationRepository.create({
      organizationId,
      invitedUserId: invitedUser.id,
      invitedBy: userId,
      role: dto.role,
      status: InvitationStatus.PENDING,
      expiresAt: new Date(Date.now() + invitationExpiresInSeconds * 1000),
    });

    // 6. Save invitation
    return this.invitationRepository.save(invitation);
  }

  async getUserInvitations(userId: string) {
    return this.invitationRepository.find({
      where: {
        invitedUserId: userId,
        status: InvitationStatus.PENDING,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async acceptInvitation(invitationId: string, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      // 1. Find pending invitation belonging to current user
      const invitation = await manager.findOne(OrganizationInvitation, {
        where: {
          id: invitationId,
          invitedUserId: userId,
          status: InvitationStatus.PENDING,
        },
      });

      if (!invitation) {
        throw new NotFoundException('Invitation not found');
      }

      // 2. Check expiration
      if (invitation.expiresAt <= new Date()) {
        invitation.status = InvitationStatus.EXPIRED;

        await manager.save(OrganizationInvitation, invitation);

        throw new ConflictException('Invitation has expired');
      }

      // 3. Prevent duplicate membership
      const existingMember = await manager.findOne(OrganizationMember, {
        where: {
          organizationId: invitation.organizationId,
          userId,
        },
      });

      if (existingMember) {
        invitation.status = InvitationStatus.CANCELLED;

        await manager.save(OrganizationInvitation, invitation);

        throw new ConflictException(
          'You are already a member of this organization',
        );
      }

      // 4. Create organization membership
      const member = manager.create(OrganizationMember, {
        organizationId: invitation.organizationId,
        userId,
        role: invitation.role as unknown as OrganizationRole,
      });

      await manager.save(OrganizationMember, member);

      // 5. Mark invitation as accepted
      invitation.status = InvitationStatus.ACCEPTED;

      await manager.save(OrganizationInvitation, invitation);

      return member;
    });
  }

  async declineInvitation(invitationId: string, userId: string) {
    const invitation = await this.invitationRepository.findOne({
      where: {
        id: invitationId,
        invitedUserId: userId,
        status: InvitationStatus.PENDING,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Check expiration
    if (invitation.expiresAt <= new Date()) {
      invitation.status = InvitationStatus.EXPIRED;

      await this.invitationRepository.save(invitation);

      throw new ConflictException('Invitation has expired');
    }

    // Decline invitation
    invitation.status = InvitationStatus.DECLINED;

    return this.invitationRepository.save(invitation);
  }
}
