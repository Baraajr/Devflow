import type { User } from './user';

export type OrganizationRole = 'owner' | 'manager' | 'developer' | 'viewer';
export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  userId: string;
  memberCount: number;
}
export interface UserOrganization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  userId: string;
  role: string;
  memberCount: number;
}

export type OrganizationMember = {
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  joinedAt: string;
  user: User;
};
