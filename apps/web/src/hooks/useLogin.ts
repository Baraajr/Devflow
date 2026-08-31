import { useMutation, useQueryClient } from '@tanstack/react-query';

import { login } from '../services/auth.service';
import { AUTH_QUERY_KEY } from './useAuth';
import { toast } from '../lib/toast';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEY,
      });

      toast.success('Signed in successfully');
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
