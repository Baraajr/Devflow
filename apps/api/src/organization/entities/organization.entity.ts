import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import slugify from 'slugify';
import * as crypto from 'crypto'; // Built-in Node.js module
import { OrganizationMember } from './organization-members.entity';

@Entity('organizations')
export class Organization {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @ApiProperty()
  @Column({ type: 'varchar', unique: true, length: 150 })
  slug: string;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    const baseSlug = slugify(this.name, { lower: true, strict: true });

    // Generates 4 random bytes (e.g., 'a1b2c3d4')
    const randomSuffix = crypto.randomBytes(4).toString('hex');

    this.slug = `${baseSlug}-${randomSuffix}`;
  }

  @OneToMany(() => OrganizationMember, (member) => member.organization)
  members: OrganizationMember[];
}
