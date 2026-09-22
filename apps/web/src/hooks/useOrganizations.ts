import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createOrg,
  deleteOrganization,
  getMyOrganizations,
  getOrganization,
  getOrganizationMembers,
  leaveOrganization,
  removeOrganizationMember,
  updateOrganization,
  type UpdateOrganizationData,
} from '../services/organization.service';

import { toast } from '../lib/toast';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../ui/ModalContext';

export const ORGANIZATIONS_QUERY_KEY = ['organizations'];

export const organizationQueryKey = (organizationId: string) => [
  'organization',
  organizationId,
];

export const organizationMembersQueryKey = (organizationId: string) => [
  'organization',
  organizationId,
  'members',
];

export function useOrganizations() {
  return useQuery({
    queryKey: ORGANIZATIONS_QUERY_KEY,
    queryFn: getMyOrganizations,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useOrganization(organizationId?: string) {
  return useQuery({
    queryKey: organizationQueryKey(organizationId!),
    queryFn: () => getOrganization(organizationId!),
    enabled: !!organizationId,
  });
}

export function useOrganizationMembers(organizationId?: string) {
  return useQuery({
    queryKey: organizationMembersQueryKey(organizationId!),
    queryFn: () => getOrganizationMembers(organizationId!),
    enabled: !!organizationId,
    staleTime: 5 * 60_000,
  });
}

export function useCreateOrg() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrg,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ORGANIZATIONS_QUERY_KEY,
      });

      toast.success('Organization created successfully');
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orgId,
      data,
    }: {
      orgId: string;
      data: UpdateOrganizationData;
    }) => updateOrganization(orgId, data),

    onSuccess: async (_data, { orgId }) => {
      await queryClient.invalidateQueries({
        queryKey: organizationQueryKey(orgId),
      });

      toast.success('Organization updated successfully');
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: deleteOrganization,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ORGANIZATIONS_QUERY_KEY,
      });

      navigate('/organizations');

      toast.success('Organization deleted successfully');
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}

type RemoveOrganizationMemberVariables = {
  organizationId: string;
  userId: string;
};

export function useRemoveOrganizationMember() {
  const { close } = useModal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      userId,
    }: RemoveOrganizationMemberVariables) =>
      removeOrganizationMember(organizationId, userId),

    onSuccess: async (_data, { organizationId }) => {
      await queryClient.invalidateQueries({
        queryKey: organizationMembersQueryKey(organizationId),
      });

      close();
      toast.success('Member removed successfully');
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useLeaveOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveOrganization,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ORGANIZATIONS_QUERY_KEY,
      });

      toast.success('You left the organization');
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
