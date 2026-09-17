import { OrganizationRole } from '../enums/organization-role.enum';

export interface UserOrganization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  userId: string;
  role: OrganizationRole;
  memberCount: number;
}
