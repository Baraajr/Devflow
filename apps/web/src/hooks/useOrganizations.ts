import { useQuery } from '@tanstack/react-query';
import { getMyOrganizations } from '../services/organization.service';

export const ORGANIZATIONS_QUERY_KEY = ['organizations'];

function useOrganizations() {
  const { data, isPending, isError } = useQuery({
    queryKey: ORGANIZATIONS_QUERY_KEY,
    queryFn: getMyOrganizations,
    staleTime: 5 * 60_000,
    retry: 1,
  });

  return { data, isPending, isError };
}

export default useOrganizations;
