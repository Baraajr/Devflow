import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createLabel,
  deleteLabel,
  getProjectLabels,
  updateLabel,
} from '../services/label.service';

export function useProjectLabels(projectId: string) {
  return useQuery({
    queryKey: ['project-labels', projectId],
    queryFn: () => getProjectLabels(projectId),
    enabled: !!projectId,
  });
}

export function useCreateLabel(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; color: string }) =>
      createLabel(projectId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project-labels', projectId],
      });
    },
  });
}

export function useUpdateLabel(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      labelId,
      data,
    }: {
      labelId: string;
      data: {
        name?: string;
        color?: string;
      };
    }) => updateLabel(projectId, labelId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project-labels', projectId],
      });
    },
  });
}

export function useDeleteLabel(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (labelId: string) => deleteLabel(projectId, labelId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project-labels', projectId],
      });
    },
  });
}
