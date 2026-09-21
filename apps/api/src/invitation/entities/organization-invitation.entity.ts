import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { InvitationStatus } from '../enums/invitation-status.enum';
import { InvitableOrganizationRole } from '../../organization/enums/invitable-organization-role.enum';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organization/entities/organization.entity';

@Entity('organization_invitations')
export class OrganizationInvitation {
  @ApiProperty({
    description: 'Unique invitation identifier',
    format: 'uuid',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Organization receiving the invitation',
    format: 'uuid',
  })
  @Column({
    name: 'organization_id',
    type: 'uuid',
  })
  organizationId: string;

  @ApiProperty({
    description: 'User receiving the invitation',
    format: 'uuid',
  })
  @Column({
    name: 'invited_user_id',
    type: 'uuid',
  })
  invitedUserId: string;

  @ApiProperty({
    description: 'User who created the invitation',
    format: 'uuid',
  })
  @Column({
    name: 'invited_by',
    type: 'uuid',
  })
  invitedBy: string;

  @ApiProperty({
    description: 'Current status of the invitation',
    enum: InvitationStatus,
    enumName: 'InvitationStatus',
  })
  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @ApiProperty({
    description: 'Role the user will receive after accepting',
    enum: InvitableOrganizationRole,
    enumName: 'InvitableOrganizationRole',
  })
  @Column({
    type: 'enum',
    enum: InvitableOrganizationRole,
  })
  role: InvitableOrganizationRole;

  @ApiProperty({
    description: 'Date and time when the invitation expires',
    format: 'date-time',
  })
  @Column({
    name: 'expires_at',
    type: 'timestamp with time zone',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'Date and time when the invitation was created',
    format: 'date-time',
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the invitation was last updated',
    format: 'date-time',
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
  })
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'invited_user_id' })
  invitedUser: User;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;
}
