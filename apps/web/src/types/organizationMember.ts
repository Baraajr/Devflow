import type { User } from './user';

export type OrganizationRole = 'owner' | 'manager' | 'developer' | 'viewer';

export type OrganizationMember = {
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  joinedAt: string;
  user: User;
};
