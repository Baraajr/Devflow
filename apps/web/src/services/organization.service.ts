import type { CreateOrgFormValues } from '../features/organization/organization.schema';
import type { UserOrganization } from '../types/UserOrganization';
import { apiRequest } from './api';

export async function getMyorganizations() {
  return apiRequest<UserOrganization[]>('/organization/', {
    method: 'GEt',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
export async function createOrg(data: CreateOrgFormValues) {
  return apiRequest('/organization/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}
