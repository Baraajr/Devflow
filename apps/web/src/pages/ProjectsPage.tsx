import { FolderKanban, Plus } from 'lucide-react';
import { NavLink, useParams } from 'react-router-dom';

import { useProjects } from '../hooks/useProjects';
import { Button } from '../ui/Button';
import Modal from '../ui/Modal';
import CreateProjectForm from '../features/project/CreateProjectForm';

function ProjectsPage() {
  const { organizationId } = useParams<{ organizationId: string }>();

  const { data, isLoading, isError, error } = useProjects(organizationId);

  if (!organizationId) {
    return (
      <div className="p-6 text-sm text-danger">Organization not found.</div>
    );
  }

  return (
    <Modal>
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Projects</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Projects you can access in this organization.
            </p>
          </div>

          <Modal.Open opens="create-project">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New project
            </Button>
          </Modal.Open>
        </div>

        {isLoading && (
          <div className="flex min-h-48 items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading projects...</p>
          </div>
        )}

        {isError && (
          <div className="rounded-lg border bg-surface p-6">
            <p className="font-medium text-danger">Failed to load projects</p>

            <p className="mt-1 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Something went wrong.'}
            </p>
          </div>
        )}

        {!isLoading && !isError && data?.data.length === 0 && (
          <div className="rounded-lg border bg-surface px-6 py-12 text-center">
            <FolderKanban className="mx-auto h-10 w-10 text-muted-foreground" />

            <h2 className="mt-4 text-lg font-semibold">No projects yet</h2>

            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Create your first project to start managing issues, sprints, and
              collaboration.
            </p>
          </div>
        )}

        {!isLoading && !isError && data && data.data.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((project) => (
              <NavLink
                key={project.id}
                to={`/organizations/${organizationId}/projects/details`}
                state={{ projectId: project.id }}
                className="group rounded-lg border bg-surface p-5 transition hover:bg-surface-hover"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FolderKanban className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate font-semibold group-hover:text-primary">
                        {project.name}
                      </h2>

                      <p className="text-xs font-medium text-muted-foreground">
                        {project.key}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-4 line-clamp-2 min-h-10 text-sm text-muted-foreground">
                  {project.description || 'No description provided.'}
                </p>
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
export default ProjectsPage;
