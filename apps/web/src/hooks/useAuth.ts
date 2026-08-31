import { useQuery } from '@tanstack/react-query';

import { getCurrentUser } from '../services/auth.service';

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
