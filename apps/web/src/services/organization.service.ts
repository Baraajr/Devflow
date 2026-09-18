import type { CreateOrgFormValues } from '../features/organization/organization.schema';
import type { Organization } from '../types/organization';
import type { OrganizationMember } from '../types/organizationMember';
import type { UserOrganization } from '../types/UserOrganization';
import { apiRequest } from './api';

export async function getMyOrganizations() {
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

export async function getOrganization(orgId: string) {
  return apiRequest<Organization>(`/organization/${orgId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function getOrganizationMembers(orgId: string) {
  return apiRequest<OrganizationMember[]>(`/organization/${orgId}/members`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function deleteOrganization(orgId: string) {
  return apiRequest<void>(`/organization/${orgId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function leaveOrganization(orgId: string) {
  return apiRequest<void>(`/organization/${orgId}/members/me`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
