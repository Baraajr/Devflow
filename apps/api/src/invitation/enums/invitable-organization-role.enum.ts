import { OrganizationRole } from '../../organization/enums/organization-role.enum';

export enum InvitableOrganizationRole {
  ADMIN = OrganizationRole.OWNER,
  DEVELOPER = OrganizationRole.DEVELOPER,
  VIEWER = OrganizationRole.VIEWER,
}
