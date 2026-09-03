import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { OrganizationRole } from '../enums/organization-role.enum';

@Entity('organization_members')
export class OrganizationMember {
  @ApiProperty()
  @PrimaryColumn({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @ApiProperty()
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ApiProperty({ enum: OrganizationRole })
  @Column({
    type: 'enum',
    enum: OrganizationRole,
    default: OrganizationRole.DEVELOPER,
  })
  role: OrganizationRole;

  @ApiProperty()
  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
