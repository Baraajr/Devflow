import { useQuery } from '@tanstack/react-query';
import { getOrganization } from '../services/organization.service';

export function useOrganization(organizationId?: string) {
  return useQuery({
    queryKey: ['organization', organizationId],
    queryFn: () => getOrganization(organizationId!),
    enabled: !!organizationId,
  });
}
