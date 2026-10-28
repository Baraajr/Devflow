import { NavLink, useParams } from 'react-router-dom';
import { CalendarRange, ListTodo, Pencil, Trash2, Users } from 'lucide-react';

import Modal from '../../ui/Modal';
import ConfirmDialog from '../../ui/ConfirmDialog';
import UpdateProjectForm from './UpdateProjectForm';
import { Button } from '../../ui/Button';
import { Tooltip } from '../../ui/Tooltip';

import {
  useDeleteProject,
  useProject,
  useProjectMembers,
} from '../../hooks/useProjects';
import { useProjectIssues } from '../../hooks/useIssues';
import { useProjectSprints } from '../../hooks/useSprints';

function StatTile({
  to,
  label,
  icon,
  count,
  isPending,
  isError,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  count: number;
  isPending: boolean;
  isError: boolean;
}) {
  return (
    <NavLink
      to={to}
      className="group rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>

        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:scale-110">
          {icon}
        </span>
      </div>

      {isError ? (
        <p className="mt-4 text-sm font-medium text-red-500">
          Failed to load {label.toLowerCase()}.
        </p>
      ) : isPending ? (
        <div className="mt-4 h-9 w-16 animate-pulse rounded-lg bg-muted" />
      ) : (
        <p className="mt-3 text-3xl font-semibold tracking-tight text-primary">
          {count}
        </p>
      )}
    </NavLink>
  );
}

function Project() {
  const { organizationId, projectId } = useParams<{
    organizationId: string;
    projectId: string;
  }>();

  const { data: project } = useProject(projectId);

  const {
    data: issues,
    isPending: isLoadingIssues,
    isError: isIssuesError,
  } = useProjectIssues(projectId ?? '');

  const {
    data: sprints,
    isPending: isLoadingSprints,
    isError: isSprintsError,
  } = useProjectSprints(projectId ?? '');

  const {
    data: members,
    isPending: isLoadingMembers,
    isError: isMembersError,
  } = useProjectMembers(projectId);

  const { mutate: deleteProject, isPending: isDeletingProject } =
    useDeleteProject(organizationId ?? '', projectId ?? '');

  if (!organizationId || !projectId) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
        <p className="text-sm font-medium text-red-500">Invalid project URL.</p>
      </div>
    );
  }

  const basePath = `/organizations/${organizationId}/projects/${projectId}`;

  return (
    <Modal>
      <div className="space-y-6">
        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary/10 via-surface to-surface px-8 py-8 shadow-sm">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="truncate text-3xl font-semibold tracking-tight text-primary">
                  {project?.name ?? 'Project'}
                </h1>

                {project?.key && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-primary">
                    {project.key}
                  </span>
                )}
              </div>

              <p className="mt-1.5 text-sm text-muted-foreground">
                Manage issues, sprints, and project members.
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1 shadow-sm">
              <Tooltip text="Edit project" position="bottom-left">
                <Modal.Open opens="update-project">
                  <Button variant="ghost" type="button">
                    <Pencil className="h-5 w-5" />
                  </Button>
                </Modal.Open>
              </Tooltip>

              <div className="mx-1 h-5 w-px bg-border" />

              <Tooltip text="Delete project" position="bottom-left">
                <Modal.Open opens="delete-project">
                  <Button variant="ghost" type="button">
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </Button>
                </Modal.Open>
              </Tooltip>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatTile
            to={`${basePath}/issues`}
            label="Issues"
            icon={<ListTodo className="h-4 w-4" />}
            count={issues?.pagination.total ?? 0}
            isPending={isLoadingIssues}
            isError={isIssuesError}
          />

          <StatTile
            to={`${basePath}/sprints`}
            label="Sprints"
            icon={<CalendarRange className="h-4 w-4" />}
            count={sprints?.length ?? 0}
            isPending={isLoadingSprints}
            isError={isSprintsError}
          />

          <StatTile
            to={`${basePath}/members`}
            label="Members"
            icon={<Users className="h-4 w-4" />}
            count={members?.length ?? 0}
            isPending={isLoadingMembers}
            isError={isMembersError}
          />
        </div>

        {/* Description */}
        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="px-6 pt-5">
            <h2 className="text-sm font-semibold text-primary">Description</h2>
          </div>

          <div className="p-6">
            {project?.description ? (
              <p className="whitespace-pre-wrap text-base leading-8 text-muted-foreground">
                {project.description}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                No description provided.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Modals */}
      <Modal.Window name="update-project">
        <UpdateProjectForm
          organizationId={organizationId}
          projectId={projectId}
        />
      </Modal.Window>

      <Modal.Window name="delete-project">
        <ConfirmDialog
          title="Delete Project?"
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
