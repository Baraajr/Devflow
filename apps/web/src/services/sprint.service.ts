import type {
  CreateSprintFormData,
  UpdateSprintFormData,
} from '../features/sprint/sprint.schema';
import type { Sprint } from '../types/sprints';
import { apiRequest } from './api';

export function getProjectSprints(projectId: string) {
  return apiRequest<Sprint[]>(`projects/${projectId}/sprints`, {
    method: 'GET',
  });
}

export function getSprint(projectId: string, sprintId: string) {
  return apiRequest<Sprint>(`projects/${projectId}/sprints/${sprintId}`, {
    method: 'GET',
  });
}

export function createSprint(projectId: string, data: CreateSprintFormData) {
  return apiRequest<Sprint>(`projects/${projectId}/sprints`, {
    method: 'POST',
    data,
  });
}

export function updateSprint(
  projectId: string,
  sprintId: string,
  data: UpdateSprintFormData,
) {
  return apiRequest<Sprint>(`projects/${projectId}/sprints/${sprintId}`, {
    method: 'PATCH',
    data,
  });
}

export function deleteSprint(projectId: string, sprintId: string) {
  return apiRequest<void>(`projects/${projectId}/sprints/${sprintId}`, {
    method: 'DELETE',
  });
}

export function startSprint(projectId: string, sprintId: string) {
  return apiRequest<Sprint>(`projects/${projectId}/sprints/${sprintId}/start`, {
    method: 'POST',
  });
}

export function completeSprint(projectId: string, sprintId: string) {
  return apiRequest<Sprint>(
    `projects/${projectId}/sprints/${sprintId}/complete`,
    {
      method: 'POST',
    },
  );
}

export function addIssueToSprint(
  projectId: string,
  sprintId: string,
  issueId: string,
) {
  return apiRequest<Sprint>(
    `projects/${projectId}/sprints/${sprintId}/issues/${issueId}`,
    {
      method: 'POST',
    },
  );
}

export function removeIssueFromSprint(
  projectId: string,
  sprintId: string,
  issueId: string,
) {
  return apiRequest<void>(
    `projects/${projectId}/sprints/${sprintId}/issues/${issueId}`,
    {
      method: 'DELETE',
    },
  );
}
