import { NavLink, useParams } from 'react-router-dom';
import {
  FolderKanban,
  ListTodo,
  Pencil,
  Trash2,
  Users,
  Zap,
} from 'lucide-react';

import {
  useDeleteOrganization,
  useOrganization,
  useOrganizationMembers,
} from '../../hooks/useOrganizations';
import { Spinner } from '../../ui/Spinner';
import Modal from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import ConfirmDialog from '../../ui/ConfirmDialog';

import UpdateOrganizationForm from '../../features/organization/UpdateOrganizationForm';
import { Tooltip } from '../../ui/Tooltip';

function Organization() {
  const { organizationId } = useParams();
  const { user } = useAuth();

  const {
    data: organization,
    isPending: isLoadingOrg,
    isError: orgError,
  } = useOrganization(organizationId);

  const {
    data: members,
    isPending: isLoadingMembers,
    isError: membersError,
  } = useOrganizationMembers(organizationId);

  const { mutate: deleteOrg, isPending: isDeletingOrg } =
    useDeleteOrganization();

  if (isLoadingOrg || isLoadingMembers) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (orgError) {
    return (
      <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 text-sm text-danger">
        Failed to load organization.
      </div>
    );
  }

  if (membersError) {
    return (
      <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 text-sm text-danger">
        Failed to load members.
      </div>
    );
  }

  const currentUserMember = members?.find(
    (member) => member.userId === user?.id,
  );

  const isOwner = currentUserMember?.role === 'owner';

  return (
    <Modal>
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-7 w-7" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">
                Organization
              </p>

              <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                {organization?.name}
              </h1>

              {organization?.description && (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {organization.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1">
            <Tooltip text="Edit" position="bottom-left">
              <Modal.Open opens="update-org">
                <Button
                  variant="ghost"
                  type="button"
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <Pencil className="h-5 w-5" />
                </Button>
              </Modal.Open>
            </Tooltip>

            {isOwner && (
              <Tooltip text="Delete organization" position="bottom-left">
                <Modal.Open opens="delete-org">
                  <Button
                    variant="ghost"
                    type="button"
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </Modal.Open>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Overview */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Overview</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A quick look at your organization.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              navTo="projects"
              title="Projects"
              value="0"
              icon={FolderKanban}
            />

            <StatCard navTo="issues" title="Issues" value="0" icon={ListTodo} />

            <StatCard
              navTo="members"
              title="Members"
              value={String(members?.length ?? 0)}
              icon={Users}
            />

            <StatCard navTo="sprints" title="Sprints" value="0" icon={Zap} />
          </div>
        </section>

        {/* Modals */}
        <Modal.Window name="update-org">
          {organizationId && <UpdateOrganizationForm orgId={organizationId} />}
        </Modal.Window>

        <Modal.Window name="delete-org">
          {organization && (
            <ConfirmDialog
              resourceName={`Organization ${organization.name}`}
              onConfirm={() => deleteOrg(organization.id)}
              disabled={isDeletingOrg}
            />
          )}
        </Modal.Window>
      </div>
    </Modal>
  );
}

function StatCard({
  title,
  value,
  navTo,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: typeof FolderKanban;
  navTo: string;
}) {
  return (
    <NavLink
      to={navTo}
      className="group rounded-xl border bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-5 w-5" />
        </div>

        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Total
        </span>
      </div>

      <p className="mt-5 text-sm text-muted-foreground">{title}</p>

      <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
    </NavLink>
  );
}

export default Organization;
