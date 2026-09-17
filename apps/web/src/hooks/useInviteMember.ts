import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '../lib/toast';
import type { invitationFormValues } from '../features/invitation/invitation.schema';
import { inviteMember } from '../services/invitation.service';

type InviteMemberVariables = {
  orgId: string;
  data: invitationFormValues;
};

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, data }: InviteMemberVariables) =>
      inviteMember(orgId, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['organization'],
      });

      toast.success('Invitation sent');
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
