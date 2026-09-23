import { apiRequest } from './api';

import type { Project, ProjectMember, ProjectMembers } from '../types/project';
import type {
  AddMemberFormValues,
  ProjectFormValues,
  UpdateProjectFormValues,
} from '../features/project/project.schema';

export interface ProjectsResponse {
  data: Project[];
  total: number;
  page: number;
  limit: number;
}

export function getProjects(organizationId: string): Promise<ProjectsResponse> {
  return apiRequest<ProjectsResponse>(
    `/organizations/${organizationId}/projects`,
  );
}

export function getProject(projectId: string): Promise<Project> {
  return apiRequest<Project>(`/projects/${projectId}`);
}

export function createProject(
  organizationId: string,
  data: ProjectFormValues,
): Promise<Project> {
  return apiRequest<Project>(`/organizations/${organizationId}/projects`, {
    method: 'POST',
    data,
  });
}

export function updateProject(
  projectId: string,
  data: UpdateProjectFormValues,
): Promise<Project> {
  return apiRequest<Project>(`/projects/${projectId}`, {
    method: 'PATCH',
    data,
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
  data: AddMemberFormValues,
): Promise<ProjectMember> {
  return apiRequest<ProjectMember>(`/projects/${projectId}/members`, {
    method: 'POST',
    data,
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
      data: { role },
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
