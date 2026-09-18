import { OrganizationRole } from './organization-role.enum';

export enum InvitableOrganizationRole {
  ADMIN = OrganizationRole.OWNER,
  DEVELOPER = OrganizationRole.DEVELOPER,
  VIEWER = OrganizationRole.VIEWER,
}
