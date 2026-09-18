import type { invitationFormValues } from '../features/invitation/invitation.schema';
import { apiRequest } from './api';

export async function inviteMember(
  organizationId: string,
  data: invitationFormValues,
) {
  return apiRequest(`/invitations/organization/${organizationId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export async function getInvitations() {
  return apiRequest('/invitations', {
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
