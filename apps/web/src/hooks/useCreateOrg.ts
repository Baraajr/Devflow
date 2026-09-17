import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createOrg } from '../services/organization.service';
import { toast } from '../lib/toast';
import { ORGANIZATIONS_QUERY_KEY } from './useOrganizations';

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
