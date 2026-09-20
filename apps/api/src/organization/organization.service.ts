import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CreateOrgDto } from './dto/create-org.dto';
import { Organization } from './entities/organization.entity';
import { OrganizationMember } from './entities/organization-members.entity';
import { OrganizationRole } from './enums/organization-role.enum';
import { UserOrganization } from './dto/User-organization';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,

    @InjectRepository(OrganizationMember)
    private readonly organizationMemberRepository: Repository<OrganizationMember>,

    private readonly dataSource: DataSource,
  ) {}

  async create(
    organizationDto: CreateOrgDto,
    userId: string,
  ): Promise<Organization> {
    const existingOrganization = await this.findByName(
      organizationDto.name,
      userId,
    );

    if (existingOrganization) {
      throw new ConflictException(
        'You already have an organization with this name',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const organization = manager.create(Organization, {
        name: organizationDto.name,
        description: organizationDto.description,
      });

      const savedOrganization = await manager.save(organization);

      const member = manager.create(OrganizationMember, {
        organizationId: savedOrganization.id,
        userId,
        role: OrganizationRole.OWNER,
      });

      await manager.save(member);

      return savedOrganization;
    });
  }

  async findByName(name: string, userId: string): Promise<Organization | null> {
    return this.organizationRepository
      .createQueryBuilder('organization')
      .innerJoin(
        OrganizationMember,
        'member',
        'member.organization_id = organization.id',
      )
      .where('member.user_id = :userId', { userId })
      .andWhere('LOWER(organization.name) = LOWER(:name)', { name })
      .getOne();
  }

  async getUserOrganizations(userId: string): Promise<UserOrganization[]> {
    return this.organizationRepository
      .createQueryBuilder('organization')
      .innerJoin(
        OrganizationMember,
        'member',
        'member.organization_id = organization.id',
      )
      .leftJoin(
        OrganizationMember,
        'members',
        'members.organization_id = organization.id',
      )
      .select([
        'organization.id AS id',
        'organization.name AS name',
        'organization.slug AS slug',
        'organization.description AS description',
        'member.user_id AS "userId"',
        'member.role AS role',
        'COUNT(members.user_id) AS "memberCount"',
      ])
      .where('member.user_id = :userId', { userId })
      .groupBy('organization.id')
      .addGroupBy('organization.name')
      .addGroupBy('organization.slug')
      .addGroupBy('organization.description')
      .addGroupBy('member.user_id')
      .addGroupBy('member.role')
      .getRawMany();
  }

  async getOrgMembers(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationMember[]> {
    const isMember = await this.organizationMemberRepository.exists({
      where: {
        organizationId,
        userId,
      },
    });

    if (!isMember) {
      throw new NotFoundException('Organization not found');
    }

    return this.organizationMemberRepository
      .createQueryBuilder('member')
      .innerJoinAndSelect('member.user', 'user')
      .where('member.organization_id = :organizationId', {
        organizationId,
      })
      .select([
        'member.organizationId',
        'member.userId',
        'member.role',
        'member.joinedAt',
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.profileImage',
      ])
      .getMany();
  }

  async getOrganization(
    userId: string,
    organizationId: string,
  ): Promise<Organization> {
    const organization = await this.organizationRepository
      .createQueryBuilder('organization')
      .innerJoin(
        OrganizationMember,
        'member',
        'member.organization_id = organization.id',
      )
      .where('organization.id = :organizationId', { organizationId })
      .andWhere('member.user_id = :userId', { userId })
      .select([
        'organization.id',
        'organization.name',
        'organization.slug',
        'organization.description',
        'organization.createdAt',
        'organization.updatedAt',
      ])
      .getOne();

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async deleteOrganization(
    userId: string,
    organizationId: string,
  ): Promise<void> {
    const member = await this.organizationMemberRepository.findOne({
      where: {
        organizationId,
        userId,
      },
    });

    if (!member) {
      throw new NotFoundException('Organization not found');
    }

    if (member.role !== OrganizationRole.OWNER) {
      throw new ConflictException(
        'Only the organization owner can delete the organization',
      );
    }

    await this.organizationRepository.delete(organizationId);
  }

  async leaveOrganization(
    userId: string,
    organizationId: string,
  ): Promise<void> {
    const member = await this.organizationMemberRepository.findOne({
      where: {
        organizationId,
        userId,
      },
    });

    if (!member) {
      throw new NotFoundException('Organization not found');
    }

    if (member.role === OrganizationRole.OWNER) {
      throw new ConflictException(
        'The organization owner cannot leave the organization',
      );
    }

    await this.organizationMemberRepository.delete({
      organizationId,
      userId,
    });
  }

  async updateOrganization(
    userId: string,
    organizationId: string,
    dto: UpdateOrganizationDto,
  ): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const membership = await this.organizationMemberRepository.findOne({
      where: {
        organizationId,
        userId,
      },
    });

    if (!membership) {
      console.log('no member');
      throw new ForbiddenException('You are not a member of this organization');
    }

    if (
      membership.role !== OrganizationRole.OWNER &&
      membership.role !== OrganizationRole.MANAGER
    ) {
      console.log('no owner');

      throw new ForbiddenException(
        'You do not have permission to update this organization',
      );
    }

    Object.assign(organization, dto);

    return this.organizationRepository.save(organization);
  }

  async updateMemberRole(
    requesterId: string,
    organizationId: string,
    targetUserId: string,
    role: OrganizationRole,
  ): Promise<OrganizationMember> {
    const requester = await this.organizationMemberRepository.findOne({
      where: {
        organizationId,
        userId: requesterId,
      },
    });

    if (!requester) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    if (requester.role !== OrganizationRole.OWNER) {
      throw new ForbiddenException(
        'Only the organization owner can change member roles',
      );
    }

    if (role === OrganizationRole.OWNER) {
      throw new BadRequestException('The owner role cannot be assigned');
    }

    const member = await this.organizationMemberRepository.findOne({
      where: {
        organizationId,
        userId: targetUserId,
      },
    });

    if (!member) {
      throw new NotFoundException('Organization member not found');
    }

    if (member.role === OrganizationRole.OWNER) {
      throw new BadRequestException('The owner role cannot be changed');
    }

    member.role = role;

    return this.organizationMemberRepository.save(member);
  }

  async removeMember(
    requesterId: string,
    organizationId: string,
    targetUserId: string,
  ): Promise<void> {
    const requester = await this.organizationMemberRepository.findOne({
      where: {
        organizationId,
        userId: requesterId,
      },
    });

    if (!requester) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    if (
      requester.role !== OrganizationRole.OWNER &&
      requester.role !== OrganizationRole.MANAGER
    ) {
      throw new ForbiddenException(
        'You do not have permission to remove members',
      );
    }

    const member = await this.organizationMemberRepository.findOne({
      where: {
        organizationId,
        userId: targetUserId,
      },
    });

    if (!member) {
      throw new NotFoundException('Organization member not found');
    }

    if (member.role === OrganizationRole.OWNER) {
      throw new BadRequestException('The organization owner cannot be removed');
    }

    if (
      requester.role === OrganizationRole.MANAGER &&
      member.role === OrganizationRole.MANAGER
    ) {
      throw new ForbiddenException('Managers cannot remove other managers');
    }

    await this.organizationMemberRepository.remove(member);
  }
}
