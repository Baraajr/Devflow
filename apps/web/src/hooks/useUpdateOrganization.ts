// hooks/useUpdateOrganization.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  updateOrganization,
  type UpdateOrganizationData,
} from '../services/organization.service';

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
        queryKey: ['organization', orgId],
      });

      toast.success('Organization updated successfully');
    },

    onError: () => {
      toast.error('Failed to update organization');
    },
  });
}
