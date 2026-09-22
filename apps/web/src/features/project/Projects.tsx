import { FolderKanban, Plus, ArrowUpRight } from 'lucide-react';
import { NavLink, useParams } from 'react-router-dom';

import { useProjects } from '../../hooks/useProjects';
import { Button } from '../../ui/Button';
import Modal from '../../ui/Modal';
import CreateProjectForm from '../../features/project/CreateProjectForm';
import { Spinner } from '../../ui/Spinner';

function Projects() {
  const { organizationId } = useParams<{ organizationId: string }>();

  const { data, isLoading, isError, error } = useProjects(organizationId);

  if (!organizationId) {
    return (
      <div className="p-6 text-sm text-danger">Organization not found.</div>
    );
  }

  const projects = data?.data ?? [];

  return (
    <Modal>
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <FolderKanban className="h-4 w-4" />
              <span>Workspace</span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Manage and collaborate on your organization projects.
            </p>
          </div>

          <Modal.Open opens="create-project">
            <Button className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              New project
            </Button>
          </Modal.Open>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex min-h-60 items-center justify-center rounded-xl border bg-surface">
            <Spinner />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-xl border border-danger/20 bg-danger/5 p-6">
            <p className="font-medium text-danger">Failed to load projects</p>

            <p className="mt-1 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Something went wrong.'}
            </p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && projects.length === 0 && (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed bg-surface px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FolderKanban className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              Create your first project
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Projects help your team organize issues, sprints, and
              collaboration in one place.
            </p>

            <Modal.Open opens="create-project">
              <Button className="mt-5">
                <Plus className="mr-2 h-4 w-4" />
                Create project
              </Button>
            </Modal.Open>
          </div>
        )}

        {/* Projects */}
        {!isLoading && !isError && projects.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium">
                {projects.length}{' '}
                {projects.length === 1 ? 'project' : 'projects'}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <NavLink
                  key={project.id}
                  to={`/organizations/${organizationId}/projects/details`}
                  state={{ projectId: project.id }}
                  className="group relative flex min-h-52 flex-col overflow-hidden rounded-xl border bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <FolderKanban className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate font-semibold">
                          {project.name}
                        </h2>

                        <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                          {project.key}
                        </p>
                      </div>
                    </div>

                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100" />
                  </div>

                  {/* Description */}
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {project.description || 'No description provided.'}
                  </p>

                  {/* Bottom */}
                  <div className="mt-auto pt-5">
                    <div className="h-px bg-border" />

                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>View project</span>

                      <span className="font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        Open →
                      </span>
                    </div>
                  </div>
                </NavLink>
              ))}
            </div>
          </>
        )}

        <Modal.Window name="create-project">
          <CreateProjectForm organizationId={organizationId} />
        </Modal.Window>
      </div>
    </Modal>
  );
}

export default Projects;
