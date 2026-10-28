import { FolderKanban, Plus, ArrowUpRight } from 'lucide-react';
import { NavLink, useParams } from 'react-router-dom';

import { useMyMembership } from '../../hooks/useOrganizations';
import { useProjects } from '../../hooks/useProjects';
import { Button } from '../../ui/Button';
import Modal from '../../ui/Modal';
import CreateProjectForm from '../../features/project/CreateProjectForm';
import { Spinner } from '../../ui/Spinner';

function Projects() {
  const { organizationId } = useParams<{ organizationId: string }>();

  const {
    data,
    isLoading: isLoadingProjects,
    isError,
    error,
  } = useProjects(organizationId);

  const { data: orgMember, isPending: isLoadingMembership } =
    useMyMembership(organizationId);

  if (!organizationId) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
        <p className="text-sm font-medium text-red-500">
          Organization not found.
        </p>
      </div>
    );
  }

  const projects = data?.data ?? [];
  const count = projects.length;

  const isOwner = orgMember?.role === 'owner';
  const isManager = orgMember?.role === 'manager';
  const canCreateProject = isOwner || isManager;

  const isLoading = isLoadingProjects || isLoadingMembership;

  return (
    <Modal>
      <div className="space-y-6">
        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary/10 via-surface to-surface px-8 py-8 shadow-sm">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight text-primary">
                  Projects
                </h1>

                {!isLoading && count > 0 && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {count}
                  </span>
                )}
              </div>

              <p className="mt-1.5 text-sm text-muted-foreground">
                Manage and collaborate on your organization projects.
              </p>
            </div>

            {canCreateProject && (
              <Modal.Open opens="create-project">
                <Button type="button">
                  <Plus size={18} />
                  New project
                </Button>
              </Modal.Open>
            )}
          </div>
        </section>

        {/* Loading */}
        {isLoading && (
          <div className="flex min-h-60 items-center justify-center rounded-2xl border border-border bg-surface shadow-sm">
            <Spinner />
          </div>
        )}

        {/* Error */}
        {!isLoading && isError && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <p className="text-sm font-medium text-red-500">
              Failed to load projects
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Something went wrong.'}
            </p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && count === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FolderKanban className="h-5 w-5" />
            </span>

            {canCreateProject ? (
              <>
                <h2 className="mt-4 font-semibold text-primary">
                  Create organization first project
                </h2>

                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Projects help your team organize issues, sprints, and
                  collaboration in one place.
                </p>

                <Modal.Open opens="create-project">
                  <Button className="mt-5">
                    <Plus size={18} />
                    Create project
                  </Button>
                </Modal.Open>
              </>
            ) : (
              <>
                <h2 className="mt-4 font-semibold text-primary">
                  No projects assigned
                </h2>

                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  You don't have access to any projects in this organization
                  yet. Ask an organization owner or manager to add you to a
                  project.
                </p>
              </>
            )}
          </div>
        )}

        {/* Projects Grid */}
        {!isLoading && !isError && count > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <NavLink
                key={project.id}
                to={`/organizations/${organizationId}/projects/${project.id}`}
                className="group relative flex min-h-52 flex-col overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <FolderKanban className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-primary">
                        {project.name}
                      </h2>

                      <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                        {project.key}
                      </p>
                    </div>
                  </div>

                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100" />
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {project.description || 'No description provided.'}
                </p>

                <div className="mt-auto pt-4">
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
        )}

        <Modal.Window name="create-project">
          <CreateProjectForm organizationId={organizationId} />
        </Modal.Window>
      </div>
    </Modal>
  );
}

export default Projects;
