import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Project } from '../../projects/entities/project.entity';
import { Issue } from '../../issue/entities/issue.entity';
@Entity('labels')
@Unique(['projectId', 'name'])
export class Label {
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
    type: 'varchar',
    length: 50,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 7,
  })
  color: string;

  @ManyToMany(() => Issue, (issue) => issue.labels)
  issues: Issue[];

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
