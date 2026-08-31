import { useMutation, useQueryClient } from '@tanstack/react-query';

import { register as signup } from '../services/auth.service';
import { AUTH_QUERY_KEY } from './useAuth';
import { toast } from 'sonner';

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signup,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEY,
      });
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
