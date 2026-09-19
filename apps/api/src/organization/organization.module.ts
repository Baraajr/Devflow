import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { Organization } from './entities/organization.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationMember } from './entities/organization-members.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization]),
    TypeOrmModule.forFeature([OrganizationMember]),
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
