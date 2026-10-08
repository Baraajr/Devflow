import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  completeSprint,
  createSprint,
  deleteSprint,
  getProjectSprints,
  getSprint,
  startSprint,
  updateSprint,
} from '../services/sprint.service';
import type {
  CreateSprintFormData,
  UpdateSprintFormData,
} from '../features/sprint/sprint.schema';

export function useProjectSprints(projectId: string) {
  return useQuery({
    queryKey: ['project-sprints', projectId],
    queryFn: () => getProjectSprints(projectId),
    enabled: Boolean(projectId),
    retry: 1,
  });
}

export function useSprint(projectId: string, sprintId: string) {
  return useQuery({
    queryKey: ['sprint', projectId, sprintId],
    queryFn: () => getSprint(projectId, sprintId),
    enabled: Boolean(projectId && sprintId),
  });
}

export function useCreateSprint(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSprintFormData) => createSprint(projectId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project-sprints', projectId],
      });

      toast.success('Sprint created successfully');
    },
  });
}

export function useUpdateSprint(projectId: string, sprintId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSprintFormData) =>
      updateSprint(projectId, sprintId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project-sprints', projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['sprint', projectId, sprintId],
      });

      toast.success('Sprint updated successfully');
    },
  });
}

export function useDeleteSprint(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sprintId: string) => deleteSprint(projectId, sprintId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project-sprints', projectId],
      });

      toast.success('Sprint deleted successfully');
    },
  });
}

export function useStartSprint(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sprintId: string) => startSprint(projectId, sprintId),

    onSuccess: (_, sprintId) => {
      queryClient.invalidateQueries({
        queryKey: ['project-sprints', projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['sprint', projectId, sprintId],
      });

      toast.success('Sprint started successfully');
    },
    onError: (err) => {
      toast.success(err.message);
    },
  });
}

export function useCompleteSprint(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sprintId: string) => completeSprint(projectId, sprintId),

    onSuccess: (_, sprintId) => {
      queryClient.invalidateQueries({
        queryKey: ['project-sprints', projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['sprint', projectId, sprintId],
      });

      toast.success('Sprint completed successfully');
    },
  });
}
