import { Module } from '@nestjs/common';
import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';
import { OrganizationInvitation } from './entities/organization-invitation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { OrganizationMember } from '../organization/entities/organization-members.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganizationInvitation, OrganizationMember]),
    UsersModule,
  ],
  controllers: [InvitationController],
  providers: [InvitationService],
})
export class InvitationModule {}
