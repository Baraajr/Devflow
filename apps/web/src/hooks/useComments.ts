import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  createComment,
  deleteComment,
  getComment,
  getIssueComments,
  updateComment,
} from '../services/comment.service';

import type {
  CreateCommentFormData,
  UpdateCommentFormData,
} from '../features/comment/comment.schema';

export function useIssueComments(projectId: string, issueId: string) {
  return useQuery({
    queryKey: ['issue-comments', projectId, issueId],
    queryFn: () => getIssueComments(projectId, issueId),
    enabled: !!projectId && !!issueId,
  });
}

export function useComment(
  projectId: string,
  issueId: string,
  commentId: string,
) {
  return useQuery({
    queryKey: ['issue-comment', projectId, issueId, commentId],
    queryFn: () => getComment(projectId, issueId, commentId),
    enabled: !!projectId && !!issueId && !!commentId,
  });
}

export function useCreateComment(projectId: string, issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentFormData) =>
      createComment(projectId, issueId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['issue-comments', projectId, issueId],
      });

      toast.success('Comment added');
    },
  });
}

export function useUpdateComment(
  projectId: string,
  issueId: string,
  commentId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCommentFormData) =>
      updateComment(projectId, issueId, commentId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['issue-comments', projectId, issueId],
      });

      queryClient.invalidateQueries({
        queryKey: ['issue-comment', projectId, issueId, commentId],
      });

      toast.success('Comment updated');
    },
  });
}

export function useDeleteComment(projectId: string, issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) =>
      deleteComment(projectId, issueId, commentId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['issue-comments', projectId, issueId],
      });

      toast.success('Comment deleted');
    },
  });
}
