import type { CreateOrgFormValues } from '../features/organization/organization.schema';
import type {
  Organization,
  OrganizationMember,
  OrganizationRole,
  UserOrganization,
} from '../types/organization';
import { apiRequest } from './api';

export async function getMyOrganizations(): Promise<UserOrganization[]> {
  return apiRequest<UserOrganization[]>('/organization');
}

export async function createOrg(
  data: CreateOrgFormValues,
): Promise<Organization> {
  return apiRequest<Organization>('/organization', {
    method: 'POST',
    data,
  });
}

export async function getOrganization(orgId: string): Promise<Organization> {
  return apiRequest<Organization>(`/organization/${orgId}`);
}

export async function getOrganizationMembers(
  orgId: string,
): Promise<OrganizationMember[]> {
  return apiRequest<OrganizationMember[]>(`/organization/${orgId}/members`);
}

export async function leaveOrganization(orgId: string): Promise<void> {
  return apiRequest<void>(`/organization/${orgId}/members/me`, {
    method: 'DELETE',
  });
}

export async function deleteOrganization(orgId: string): Promise<void> {
  return apiRequest<void>(`/organization/${orgId}`, {
    method: 'DELETE',
  });
}

export async function updateOrganization(
  orgId: string,
  data: CreateOrgFormValues,
): Promise<Organization> {
  return apiRequest<Organization>(`/organization/${orgId}`, {
    method: 'PATCH',
    data,
  });
}

export async function removeOrganizationMember(
  organizationId: string,
  userId: string,
): Promise<void> {
  return apiRequest<void>(`/organization/${organizationId}/members/${userId}`, {
    method: 'DELETE',
  });
}

export interface UpdateMemberRoleData {
  role: Exclude<OrganizationRole, 'owner'>;
}

export async function updateMemberRole(
  organizationId: string,
  userId: string,
  data: UpdateMemberRoleData,
): Promise<void> {
  return apiRequest<void>(
    `/organization/${organizationId}/members/${userId}/role`,
    {
      method: 'PATCH',
      data,
    },
  );
}
