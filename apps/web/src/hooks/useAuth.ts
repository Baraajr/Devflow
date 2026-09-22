import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { toast } from '../lib/toast';
import {
  getCurrentUser,
  login,
  logout,
  register as signup,
} from '../services/auth.service';

export const AUTH_QUERY_KEY = ['auth', 'me'];

export function useAuth() {
  const query = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getCurrentUser,
    retry: false,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,
    isError: query.isError,
  };
}

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

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
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

  return {
    logout: mutation.mutate,
    isLoggingOut: mutation.isPending,
  };
}

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
