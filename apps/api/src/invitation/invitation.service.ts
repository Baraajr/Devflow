import {
  BadRequestException,
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
import { OrganizationService } from '../organization/organization.service';

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

    private readonly organizationService: OrganizationService,
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

    // 2. Find the organization
    const organization = await this.organizationService.getOrganization(
      userId,
      organizationId,
    );

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // 3. Find the user being invited
    const invitedUser = await this.usersService.findByEmail(
      dto.invitedUserEmail,
    );

    if (!invitedUser) {
      throw new NotFoundException('User with this email does not exist');
    }

    // 4. Prevent inviting an existing member
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

    // 5. Prevent duplicate pending invitations
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

    // 6. Create invitation
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

    // 7. Save invitation
    const savedInvitation = await this.invitationRepository.save(invitation);

    //send email later

    return savedInvitation;
  }

  async getUserInvitations(userId: string) {
    return this.invitationRepository.find({
      where: {
        invitedUserId: userId,
      },
      relations: {
        invitedUser: true,
        organization: true,
      },
      select: {
        id: true,
        organizationId: true,
        invitedUserId: true,
        invitedBy: true,
        status: true,
        role: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,

        organization: {
          name: true,
        },
        invitedUser: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async acceptInvitation(invitationId: string, userId: string) {
    const invitation = await this.invitationRepository.findOne({
      where: {
        id: invitationId,
        invitedUserId: userId,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ConflictException(
        `Invitation is already ${invitation.status.toLowerCase()}`,
      );
    }

    // Expiration must be committed before throwing.
    if (invitation.expiresAt <= new Date()) {
      invitation.status = InvitationStatus.EXPIRED;
      await this.invitationRepository.save(invitation);

      throw new ConflictException('Invitation has expired');
    }

    // Check before starting the transaction because this status change
    // must persist even though we throw a ConflictException.
    const existingMember = await this.organizationMemberRepository.findOne({
      where: {
        organizationId: invitation.organizationId,
        userId,
      },
    });

    if (existingMember) {
      invitation.status = InvitationStatus.CANCELLED;
      await this.invitationRepository.save(invitation);

      throw new ConflictException(
        'You are already a member of this organization',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const member = manager.create(OrganizationMember, {
        organizationId: invitation.organizationId,
        userId,
        role: invitation.role as unknown as OrganizationRole,
      });

      await manager.save(OrganizationMember, member);

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
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ConflictException(
        `Invitation is already ${invitation.status.toLowerCase()}`,
      );
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

  async getInvitation(
    invitationId: string,
    userId: string,
  ): Promise<OrganizationInvitation> {
    const invitation = await this.invitationRepository.findOne({
      where: {
        id: invitationId,
        invitedUserId: userId,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    return invitation;
  }

  async getOrganizationInvitations(organizationId: string, userId: string) {
    const member = await this.organizationMemberRepository.findOne({
      where: {
        organizationId,
        userId,
      },
    });

    if (!member) {
      throw new NotFoundException('Organization not found');
    }

    if (
      member.role !== OrganizationRole.OWNER &&
      member.role !== OrganizationRole.MANAGER
    ) {
      throw new ForbiddenException(
        'You do not have permission to view organization invitations',
      );
    }

    return this.invitationRepository.find({
      where: {
        organizationId,
      },
      relations: {
        invitedUser: true,
      },
      select: {
        id: true,
        organizationId: true,
        invitedUserId: true,
        invitedBy: true,
        status: true,
        role: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,

        invitedUser: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async revokeInvitation(invitationId: string, userId: string): Promise<void> {
    const invitation = await this.invitationRepository.findOne({
      where: {
        id: invitationId,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const member = await this.organizationMemberRepository.findOne({
      where: {
        organizationId: invitation.organizationId,
        userId,
      },
    });

    if (!member) {
      throw new NotFoundException('Organization not found');
    }

    if (
      member.role !== OrganizationRole.OWNER &&
      member.role !== OrganizationRole.MANAGER
    ) {
      throw new ForbiddenException(
        'You do not have permission to revoke invitations',
      );
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Only pending invitations can be revoked');
    }

    invitation.status = InvitationStatus.CANCELLED;

    await this.invitationRepository.save(invitation);
  }
}
