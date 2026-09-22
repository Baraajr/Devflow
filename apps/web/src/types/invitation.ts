import type { Organization } from './organization';

export type InvitationStatus =
  | 'pending'
  | 'accepted'
  | 'expired'
  | 'declined'
  | 'cancelled';

export type InvitationRole = 'manager' | 'developer' | 'viewer';

export interface InvitationUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Invitation {
  id: string;
  organizationId: string;
  invitedUserId: string;
  invitedBy: string;

  status: InvitationStatus;
  role: InvitationRole;

  expiresAt: string;
  createdAt: string;
  updatedAt: string;

  organization: Partial<Organization>;
  invitedUser: InvitationUser;
}
