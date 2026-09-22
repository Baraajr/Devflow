import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { Project } from './project.entity';
import { User } from '../../users/entities/user.entity';
import { ProjectRole } from '../enums/project-role.enum';

@Entity('project_members')
@Index(['organizationId', 'projectId'])
@Index(['organizationId', 'userId'])
@Index(['userId'])
export class ProjectMember {
  @PrimaryColumn({
    name: 'project_id',
    type: 'uuid',
  })
  projectId: string;

  @PrimaryColumn({
    name: 'user_id',
    type: 'uuid',
  })
  userId: string;

  @Column({
    name: 'organization_id',
    type: 'uuid',
  })
  organizationId: string;

  @ManyToOne(() => Project, (project) => project.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'varchar',
    length: 30,
    default: ProjectRole.DEVELOPER,
  })
  role: ProjectRole;

  @CreateDateColumn({
    name: 'joined_at',
    type: 'timestamptz',
  })
  joinedAt: Date;
}
