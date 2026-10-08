import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { SprintStatus } from '../enums/sprint-status.enum';
import { Issue } from '../../issue/entities/issue.entity';

@Entity('sprints')
export class Sprint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  goal: string | null;

  @Column({
    type: 'enum',
    enum: SprintStatus,
    default: SprintStatus.PLANNED,
  })
  status: SprintStatus;

  @Column({ type: 'date', nullable: true })
  startDate: string | null;

  @Column({ type: 'date', nullable: true })
  endDate: string | null;

  @Column({ type: 'uuid' })
  projectId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Issue, (issue) => issue.sprint)
  issues: Issue[];
}
