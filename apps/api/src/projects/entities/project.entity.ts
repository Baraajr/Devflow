import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Organization } from '../../organization/entities/organization.entity';
import { ProjectMember } from './project-member.entity';

@Entity('projects')
@Index(['organizationId', 'id'], { unique: true })
@Index(['organizationId', 'key'], { unique: true })
@Index(['organizationId', 'slug'], { unique: true })
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  key: string;

  @Column({ type: 'varchar', length: 150 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => ProjectMember, (member) => member.project)
  members: ProjectMember[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;
}
