import { apiRequest } from './api';

import type {
  AddProjectMemberInput,
  CreateProjectInput,
  Project,
  ProjectListResponse,
  ProjectMember,
  ProjectMembers,
  UpdateProjectInput,
} from '../types/project';

export function getProjects(
  organizationId: string,
): Promise<ProjectListResponse> {
  return apiRequest<ProjectListResponse>(
    `/organizations/${organizationId}/projects`,
  );
}

export function getProject(projectId: string): Promise<Project> {
  return apiRequest<Project>(`/projects/${projectId}`);
}

export function createProject(
  organizationId: string,
  data: CreateProjectInput,
): Promise<Project> {
  console.log(data);
  return apiRequest<Project>(`/organizations/${organizationId}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export function updateProject(
  projectId: string,
  data: UpdateProjectInput,
): Promise<Project> {
  return apiRequest<Project>(`/projects/${projectId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export function deleteProject(projectId: string): Promise<void> {
  return apiRequest<void>(`/projects/${projectId}`, {
    method: 'DELETE',
  });
}

export function getProjectMembers(
  projectId: string,
): Promise<ProjectMembers[]> {
  return apiRequest<ProjectMembers[]>(`/projects/${projectId}/members`);
}

export function addProjectMember(
  projectId: string,
  data: AddProjectMemberInput,
): Promise<ProjectMember> {
  return apiRequest<ProjectMember>(`/projects/${projectId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export function updateProjectMemberRole(
  projectId: string,
  memberUserId: string,
  role: ProjectMember['role'],
): Promise<ProjectMember> {
  return apiRequest<ProjectMember>(
    `/projects/${projectId}/members/${memberUserId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    },
  );
}

export function removeProjectMember(
  projectId: string,
  memberUserId: string,
): Promise<void> {
  return apiRequest<void>(`/projects/${projectId}/members/${memberUserId}`, {
    method: 'DELETE',
  });
}
