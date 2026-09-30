import type {
  CreateIssueFormData,
  UpdateIssueFormData,
} from '../features/issue/issue.schema';
import type { Issue } from '../types/issue';
import type { Label } from '../types/label';
import { apiRequest } from './api';

export function getProjectIssues(projectId: string) {
  return apiRequest<Issue[]>(`projects/${projectId}/issues`, {
    method: 'GET',
  });
}

export function getIssue(projectId: string, issueId: string) {
  return apiRequest<Issue>(`projects/${projectId}/issues/${issueId}`, {
    method: 'GET',
  });
}

export function createIssue(projectId: string, data: CreateIssueFormData) {
  return apiRequest<Issue>(`projects/${projectId}/issues`, {
    method: 'POST',
    data,
  });
}

export function updateIssue(
  projectId: string,
  issueId: string,
  data: UpdateIssueFormData,
) {
  return apiRequest<Issue>(`projects/${projectId}/issues/${issueId}`, {
    method: 'PATCH',
    data,
  });
}

export function deleteIssue(projectId: string, issueId: string) {
  return apiRequest<void>(`projects/${projectId}/issues/${issueId}`, {
    method: 'DELETE',
  });
}

export function assignIssue(
  projectId: string,
  issueId: string,
  assigneeId: string,
) {
  return apiRequest<Issue>(`projects/${projectId}/issues/${issueId}/assign`, {
    method: 'PATCH',
    data: {
      assigneeId,
    },
  });
}

export function addIssueLabel(
  projectId: string,
  issueId: string,
  labelId: string,
) {
  return apiRequest<Label>(
    `projects/${projectId}/issues/${issueId}/labels/${labelId}`,
    {
      method: 'POST',
    },
  );
}

export function removeIssueLabel(
  projectId: string,
  issueId: string,
  labelId: string,
) {
  return apiRequest<void>(
    `projects/${projectId}/issues/${issueId}/labels/${labelId}`,
    {
      method: 'DELETE',
    },
  );
}
