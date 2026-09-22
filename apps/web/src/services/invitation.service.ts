import type { invitationFormValues } from '../features/invitation/invitation.schema';
import { apiRequest } from './api';
import type { Invitation } from '../types/invitation';

export async function inviteMember(
  organizationId: string,
  data: invitationFormValues,
) {
  return apiRequest(`/invitations/organization/${organizationId}`, {
    method: 'POST',
    data,
  });
}

export async function getInvitations() {
  return apiRequest<Invitation[]>('/invitations', {
    method: 'GET',
  });
}

export async function getOrganizationInvitations(
  organizationId: string,
): Promise<Invitation[]> {
  return apiRequest<Invitation[]>(
    `/invitations/organization/${organizationId}`,
    {
      method: 'GET',
    },
  );
}

export async function getInvitation(invitationId: string) {
  return apiRequest(`/invitations/${invitationId}`, {
    method: 'GET',
  });
}

export async function acceptInvitation(invitationId: string) {
  return apiRequest(`/invitations/${invitationId}/accept`, {
    method: 'POST',
  });
}

export async function declineInvitation(invitationId: string) {
  return apiRequest(`/invitations/${invitationId}/decline`, {
    method: 'POST',
  });
}

export async function revokeInvitation(invitationId: string) {
  return apiRequest(`/invitations/${invitationId}`, {
    method: 'DELETE',
  });
}
