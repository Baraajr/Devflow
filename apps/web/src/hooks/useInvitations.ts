import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { invitationFormValues } from '../features/invitation/invitation.schema';

import {
  acceptInvitation,
  declineInvitation,
  getInvitations,
  getOrganizationInvitations,
  inviteMember,
  revokeInvitation,
} from '../services/invitation.service';

import { toast } from '../lib/toast';
import { useModal } from '../ui/ModalContext';

type InviteMemberVariables = {
  orgId: string;
  data: invitationFormValues;
};

export const invitationsQueryKey = ['invitations'];

export const organizationInvitationsQueryKey = (organizationId: string) => [
  'organization',
  organizationId,
  'invitations',
];

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, data }: InviteMemberVariables) =>
      inviteMember(orgId, data),

    onSuccess: async (_data, { orgId }) => {
      await queryClient.invalidateQueries({
        queryKey: organizationInvitationsQueryKey(orgId),
      });

      toast.success('Invitation sent');
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useOrganizationInvitations(organizationId?: string) {
  return useQuery({
    queryKey: organizationInvitationsQueryKey(organizationId!),
    queryFn: () => getOrganizationInvitations(organizationId!),
    enabled: !!organizationId,
    staleTime: 60_000,
  });
}

export function useInvitations() {
  return useQuery({
    queryKey: invitationsQueryKey,
    queryFn: getInvitations,
    staleTime: 60_000,
  });
}

export function useRevokeInvitation(organizationId: string) {
  const { close } = useModal();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => revokeInvitation(invitationId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organization', organizationId, 'invitations'],
      });

      toast.success('Invitation cancelled');
      close();
    },

    onError: (err) => {
      toast.error(err.message);
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => acceptInvitation(invitationId),
    onSuccess: () => {
      toast.success('Invitation accepted');

      queryClient.invalidateQueries({
        queryKey: ['invitations'],
      });
    },
    onError: (err) => {
      toast.error(err.message);
      queryClient.invalidateQueries({
        queryKey: ['invitations'],
      });
    },
  });
}

export function useDeclineInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => declineInvitation(invitationId),
    onSuccess: () => {
      toast.success('Invitation declined');

      queryClient.invalidateQueries({
        queryKey: ['invitations'],
      });
    },
    onError: (err) => {
      queryClient.invalidateQueries({
        queryKey: ['invitations'],
      });
      toast.error(err.message);
    },
  });
}
