import { useMutation, useQueryClient } from '@tanstack/react-query';

import { logout } from '../services/auth.service';
import { AUTH_QUERY_KEY } from './useAuth';
import { toast } from '../lib/toast';
import { useNavigate } from 'react-router-dom';

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: logout,

    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: AUTH_QUERY_KEY,
      });

      navigate('/', { replace: true });
      toast.success('Signed out successfully');
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { logout: mutate, isLoggingout: isPending };
}
