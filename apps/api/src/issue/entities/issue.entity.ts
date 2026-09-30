import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';
import { IssueStatus } from '../enums/Issue-status.enum';
import { IssueType } from '../enums/Issue-type.enum';
import { IssuePriority } from '../enums/Issue-priority.enum';
import { Label } from '../../label/entities/label.entity';

@Entity('issues')
export class Issue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'project_id',
    type: 'uuid',
  })
  projectId: string;

  @ManyToOne(() => Project, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({
    name: 'reporter_id',
    type: 'uuid',
  })
  reporterId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column({
    name: 'assignee_id',
    type: 'uuid',
    nullable: true,
  })
  assigneeId: string | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User | null;

  @Column({
    name: 'parent_issue_id',
    type: 'uuid',
    nullable: true,
  })
  parentIssueId: string | null;

  @ManyToOne(() => Issue, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_issue_id' })
  parentIssue: Issue | null;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    name: 'issue_type',
    type: 'enum',
    enum: IssueType,
  })
  issueType: IssueType;

  @Column({
    type: 'enum',
    enum: IssueStatus,
    default: IssueStatus.TODO,
  })
  status: IssueStatus;

  @Column({
    type: 'enum',
    enum: IssuePriority,
    default: IssuePriority.MEDIUM,
  })
  priority: IssuePriority;

  @Column({
    name: 'issue_number',
    type: 'integer',
  })
  issueNumber: number;

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

  @ManyToMany(() => Label, (label) => label.issues)
  @JoinTable({
    name: 'issue_labels',
    joinColumn: {
      name: 'issue_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'label_id',
      referencedColumnName: 'id',
    },
  })
  labels: Label[];
}
