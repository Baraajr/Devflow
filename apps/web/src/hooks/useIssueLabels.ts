import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addIssueLabel, removeIssueLabel } from '../services/issue.service';

export function useAddIssueLabel(projectId: string, issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (labelId: string) => addIssueLabel(projectId, issueId, labelId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['issue', projectId, issueId],
      });
    },
  });
}

export function useRemoveIssueLabel(projectId: string, issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (labelId: string) =>
      removeIssueLabel(projectId, issueId, labelId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['issue', projectId, issueId],
      });
    },
  });
}
