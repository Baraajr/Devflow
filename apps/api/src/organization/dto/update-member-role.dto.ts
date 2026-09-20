import { IsEnum } from 'class-validator';
import { OrganizationRole } from '../enums/organization-role.enum';

export class UpdateMemberRoleDto {
  @IsEnum(OrganizationRole)
  role: OrganizationRole;
}
