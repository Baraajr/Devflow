import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Organization } from './entities/organization.entity';
import { CreateOrgDto } from './dto/create-org.dto';
import { OrganizationService } from './organization.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Organizations')
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateOrgDto,
  ): Promise<Organization> {
    const organization = await this.organizationService.create(dto, user.id);

    return organization;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMyOrganizations(@CurrentUser() user: User) {
    const organizations = await this.organizationService.getUserOrganizations(
      user.id,
    );

    return organizations;
  }
}
