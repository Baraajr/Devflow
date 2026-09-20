import { useQuery } from '@tanstack/react-query';
import { getOrganizationMembers } from '../services/organization.service';

export function useOrganizationMembers(organizationId?: string) {
  return useQuery({
    queryKey: ['organization', organizationId, 'members'],
    queryFn: () => getOrganizationMembers(organizationId!),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
}
