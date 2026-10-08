import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  assignIssue,
  createIssue,
  deleteIssue,
  getIssue,
  getProjectIssues,
  updateIssue,
} from '../services/issue.service';

import type {
  CreateIssueFormData,
  UpdateIssueFormData,
} from '../features/issue/issue.schema';
import type { IssueSort } from '../types/issue';

export function useProjectIssues(
  projectId: string,
  page = 1,
  limit = 20,
  sort: IssueSort = 'issueNumber',
  order: 'asc' | 'desc' = 'desc',
) {
  return useQuery({
    queryKey: ['issues', projectId, sort, order, page, limit],
    queryFn: () => getProjectIssues(projectId, { page, limit, sort, order }),
    enabled: !!projectId,
  });
}

export function useIssue(projectId: string, issueId: string) {
  return useQuery({
    queryKey: ['issue', projectId, issueId],
    queryFn: () => getIssue(projectId, issueId),
    enabled: !!projectId && !!issueId,
  });
}

export function useCreateIssue(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIssueFormData) => createIssue(projectId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['issues', projectId],
      });

      toast.success('Issue created successfully');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to create issue');
    },
  });
}

export function useUpdateIssue(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      issueId,
      data,
    }: {
      issueId: string;
      data: UpdateIssueFormData;
    }) => updateIssue(projectId, issueId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['issues', projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['issue', projectId, variables.issueId],
      });

      toast.success('Issue updated successfully');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to update issue');
    },
  });
}

export function useDeleteIssue(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issueId: string) => deleteIssue(projectId, issueId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['issues', projectId],
      });

      toast.success('Issue deleted successfully');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to delete issue');
    },
  });
}

export function useAssignIssue(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      issueId,
      assigneeId,
    }: {
      issueId: string;
      assigneeId: string;
    }) => assignIssue(projectId, issueId, assigneeId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['issues', projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['issue', projectId, variables.issueId],
      });

      toast.success('Issue assigned successfully');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to assign issue');
    },
  });
}
