import { apiRequest } from './api';

import type {
  CreateCommentFormData,
  UpdateCommentFormData,
} from '../features/comment/comment.schema';

import type { IssueComment } from '../types/comment';

export function getIssueComments(projectId: string, issueId: string) {
  return apiRequest<IssueComment[]>(
    `/projects/${projectId}/issues/${issueId}/comments`,
  );
}

export function getComment(
  projectId: string,
  issueId: string,
  commentId: string,
) {
  return apiRequest<IssueComment>(
    `/projects/${projectId}/issues/${issueId}/comments/${commentId}`,
  );
}

export function createComment(
  projectId: string,
  issueId: string,
  data: CreateCommentFormData,
) {
  return apiRequest<IssueComment>(
    `/projects/${projectId}/issues/${issueId}/comments`,
    {
      method: 'POST',
      data,
    },
  );
}

export function updateComment(
  projectId: string,
  issueId: string,
  commentId: string,
  data: UpdateCommentFormData,
) {
  return apiRequest<IssueComment>(
    `/projects/${projectId}/issues/${issueId}/comments/${commentId}`,
    {
      method: 'PATCH',
      data,
    },
  );
}

export function deleteComment(
  projectId: string,
  issueId: string,
  commentId: string,
) {
  return apiRequest<void>(
    `/projects/${projectId}/issues/${issueId}/comments/${commentId}`,
    {
      method: 'DELETE',
    },
  );
}
