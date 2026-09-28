import { NavLink, useParams } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';

import Modal from '../../ui/Modal';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { Spinner } from '../../ui/Spinner';

import UpdateProjectForm from './UpdateProjectForm';

import { useDeleteProject, useProject } from '../../hooks/useProjects';

import { Button } from '../../ui/Button';
import { Tooltip } from '../../ui/Tooltip';
import { useProjectIssues } from '../../hooks/useIssues';

function Project() {
  const { organizationId, projectId } = useParams<{
    organizationId: string;
    projectId: string;
  }>();

  if (!organizationId || !projectId) {
    return (
      <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">Invalid project URL.</p>
      </div>
    );
  }
  const {
    data: issues,
    isPending: isLoadingIssues,
    isError: issuesError,
  } = useProjectIssues(projectId);

  const {
    data: project,
    isPending: isProjectPending,
    isError: isProjectError,
  } = useProject(projectId);

  const { mutate: deleteProject, isPending: isDeletingProject } =
    useDeleteProject(organizationId, projectId);

  if (isProjectPending) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isProjectError) {
    return (
      <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">Failed to load project.</p>
      </div>
    );
  }

  return (
    <Modal>
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Project Overview
            </h1>

            <p className="text-sm text-gray-500">
              Viewing details for project ID:
              <span className="font-mono">{project.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip position="bottom-left" text="edit project">
              <Modal.Open opens="update-project">
                <Button
                  variant="ghost"
                  type="button"
                  title="Update Project"
                  className="cursor-pointer rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary-600"
                >
                  <Pencil className="h-5 w-5" />
                </Button>
              </Modal.Open>
            </Tooltip>
            <Tooltip position="bottom-left" text="delete project">
              <Modal.Open opens="delete-project">
                <Button
                  variant="ghost"
                  type="button"
                  title="Delete Project"
                  className="cursor-pointer rounded-lg p-2 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </Modal.Open>
            </Tooltip>
          </div>
        </div>

        {/* Project Stats */}
        {/* Project Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="mt-1 text-lg font-semibold text-success">Active</p>
          </div>

          <NavLink
            to={'issues'}
            className="rounded-xl border border-border bg-surface p-6 shadow-sm"
          >
            {issuesError ? (
              <p>Error loading issues</p>
            ) : isLoadingIssues ? (
              <Spinner />
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">
                  Issues
                </p>
                <p className="mt-1 text-lg font-semibold text-primary">
                  {issues?.length}
                </p>
              </>
            )}
          </NavLink>

          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              Due Date
            </p>
            <p className="mt-1 text-lg font-semibold text-primary">
              Oct 31, 2026
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3 rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            Project Description
          </h2>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {project.description || 'No description provided.'}
          </p>
        </div>
      </div>

      {/* Update Project */}
      <Modal.Window name="update-project">
        <UpdateProjectForm
          organizationId={organizationId}
          projectId={projectId}
        />
      </Modal.Window>

      {/* Delete Project */}
      <Modal.Window name="delete-project">
        <ConfirmDialog
          title={`Delete Project? ${project.name}`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={deleteProject}
          disabled={isDeletingProject}
        />
      </Modal.Window>
    </Modal>
  );
}

export default Project;
