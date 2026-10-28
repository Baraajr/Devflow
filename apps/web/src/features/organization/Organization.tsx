import { NavLink, useOutletContext, useParams } from 'react-router-dom';
import { FolderKanban, Pencil, Trash2, Users } from 'lucide-react';

import {
  useDeleteOrganization,
  useMyMembership,
  useOrganizationMembers,
} from '../../hooks/useOrganizations';
import { useProjects } from '../../hooks/useProjects';

import Modal from '../../ui/Modal';
import { Button } from '../../ui/Button';
import ConfirmDialog from '../../ui/ConfirmDialog';
import UpdateOrganizationForm from '../../features/organization/UpdateOrganizationForm';
import { Tooltip } from '../../ui/Tooltip';
import type { Organization } from '../../types/organization';

/* ---------- Page ---------- */

function OrganizationContent() {
  const { organizationId } = useParams<{ organizationId: string }>();

  const organization = useOutletContext<Organization>();

  const { data: orgMember, isPending: isLoadingMembership } =
    useMyMembership(organizationId);

  const isOwner = orgMember?.role === 'owner';
  const isManager = orgMember?.role === 'manager';

  const canEditOrganization = isOwner || isManager;
  const canViewMembers = isOwner || isManager;

  const {
    data: members,
    isPending: isLoadingMembers,
    isError: membersError,
  } = useOrganizationMembers(canViewMembers ? organizationId : '');

  const {
    data: projects,
    isPending: isLoadingProjects,
    isError: isProjectError,
  } = useProjects(organizationId);

  const { mutate: deleteOrg, isPending: isDeletingOrg } =
    useDeleteOrganization();

  if (!organizationId) {
    return null;
  }

  if (isLoadingMembership) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-3xl bg-surface" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-surface"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary/10 via-surface to-surface px-8 py-8 shadow-sm">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Users className="h-7 w-7" />
            </span>

            <div className="min-w-0">
              <h1 className="truncate text-3xl font-semibold tracking-tight text-primary">
                {organization.name}
              </h1>

              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
                {organization.description ||
                  'Manage your projects and team members.'}
              </p>
            </div>
          </div>

          {canEditOrganization && (
            <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1 shadow-sm">
              <Tooltip text="Edit organization" position="bottom-left">
                <Modal.Open opens="update-org">
                  <Button variant="ghost" type="button">
                    <Pencil className="h-5 w-5" />
                  </Button>
                </Modal.Open>
              </Tooltip>

              {isOwner && (
                <>
                  <div className="mx-1 h-5 w-px bg-border" />

                  <Tooltip text="Delete organization" position="bottom-left">
                    <Modal.Open opens="delete-org">
                      <Button variant="ghost" type="button">
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </Button>
                    </Modal.Open>
                  </Tooltip>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Overview */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-primary">Overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A summary of your organization and its resources.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatTile
            to="projects"
            label="Projects"
            icon={<FolderKanban className="h-4 w-4" />}
            count={projects?.data.length ?? 0}
            isPending={isLoadingProjects}
            isError={isProjectError}
          />

          {canViewMembers && (
            <StatTile
              to="members"
              label="Members"
              icon={<Users className="h-4 w-4" />}
              count={members?.length ?? 0}
              isPending={isLoadingMembers}
              isError={membersError}
            />
          )}
        </div>
      </section>

      {/* Modals */}
      <Modal.Window name="update-org">
        <UpdateOrganizationForm orgId={organizationId} />
      </Modal.Window>

      <Modal.Window name="delete-org">
        <ConfirmDialog
          resourceName={`Organization ${organization.name}`}
          description="This organization and all of its projects will be permanently deleted."
          onConfirm={() => deleteOrg(organization.id)}
          disabled={isDeletingOrg}
        />
      </Modal.Window>
    </div>
  );
}

/* ---------- Stat tile ---------- */

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

export default OrganizationContent;
