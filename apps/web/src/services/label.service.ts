import type { Label } from '../types/label';
import { apiRequest } from './api';

export function getProjectLabels(projectId: string) {
  return apiRequest<Label[]>(`projects/${projectId}/labels`, {
    method: 'GET',
  });
}

export function createLabel(
  projectId: string,
  data: Pick<Label, 'name' | 'color'>,
) {
  return apiRequest<Label>(`projects/${projectId}/labels`, {
    method: 'POST',
    data,
  });
}

export function updateLabel(
  projectId: string,
  labelId: string,
  data: Partial<Pick<Label, 'name' | 'color'>>,
) {
  return apiRequest<Label>(`projects/${projectId}/labels/${labelId}`, {
    method: 'PATCH',
    data,
  });
}

export function deleteLabel(projectId: string, labelId: string) {
  return apiRequest<void>(`projects/${projectId}/labels/${labelId}`, {
    method: 'DELETE',
  });
}
