import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  addProjectMember,
  createProject,
  deleteProject,
  getProject,
  getProjectMembers,
  getProjects,
  removeProjectMember,
  updateProject,
  updateProjectMemberRole,
} from '../services/project.service';
import type { ProjectMember } from '../types/project';
import type {
  ProjectFormValues,
  AddMemberFormValues,
  UpdateProjectFormValues,
} from '../features/project/project.schema';

// --- Query Key Factory ---
export const projectKeys = {
  all: ['projects'] as const,

  organization: (organizationId: string) =>
    [...projectKeys.all, 'organization', organizationId] as const,

  detail: (projectId: string) =>
    [...projectKeys.all, 'detail', projectId] as const,

  members: (projectId: string) =>
    [...projectKeys.detail(projectId), 'members'] as const,
};

// --- Project Queries ---

export function useProjects(organizationId?: string) {
  return useQuery({
    queryKey: organizationId
      ? projectKeys.organization(organizationId)
      : projectKeys.all,
    queryFn: () => getProjects(organizationId!),
    enabled: Boolean(organizationId),
  });
}

import axios from 'axios';

export function useProject(projectId?: string) {
  return useQuery({
    queryKey: projectId ? projectKeys.detail(projectId) : projectKeys.all,
    queryFn: () => getProject(projectId!),
    enabled: Boolean(projectId),

    staleTime: 30_000,

    retry: (failureCount, error) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status && status >= 400 && status < 500) {
          return false;
        }
      }

      return failureCount < 1;
    },
  });
}

// --- Project Mutations ---

export function useCreateProject(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProjectFormValues) =>
      createProject(organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.organization(organizationId),
      });
      toast.success('Project created successfully');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}

export function useUpdateProject(organizationId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProjectFormValues) =>
      updateProject(projectId, data),
    onSuccess: (project) => {
      queryClient.setQueryData(projectKeys.detail(projectId), project);
      queryClient.invalidateQueries({
        queryKey: projectKeys.organization(organizationId),
      });
      toast.success('Project updated successfully');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}

export function useDeleteProject(organizationId: string, projectId: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => deleteProject(projectId),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: projectKeys.detail(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.organization(organizationId),
      });
      toast.success('Project deleted successfully');
      navigate(-1);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}

// --- Project Member Queries & Mutations ---

export function useProjectMembers(projectId?: string) {
  return useQuery({
    queryKey: projectId ? projectKeys.members(projectId) : projectKeys.all,
    queryFn: () => getProjectMembers(projectId!),
    enabled: Boolean(projectId),
  });
}

export function useAddProjectMember(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddMemberFormValues) =>
      addProjectMember(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.members(projectId),
      });
      toast.success('Member added successfully');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}

export function useUpdateProjectMemberRole(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberUserId,
      role,
    }: {
      memberUserId: string;
      role: ProjectMember['role'];
    }) => updateProjectMemberRole(projectId, memberUserId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.members(projectId),
      });
      toast.success('Member role updated successfully');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}

export function useRemoveProjectMember(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberUserId: string) =>
      removeProjectMember(projectId, memberUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.members(projectId),
      });
      toast.success('Member removed successfully');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}
