import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CreateOrgDto } from './dto/create-org.dto';
import { Organization } from './entities/organization.entity';
import { OrganizationMember } from './entities/organization-members.entity';
import { OrganizationRole } from './enums/organization-role.enum';
import { UserOrganization } from './dto/User-organization';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,

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
}
