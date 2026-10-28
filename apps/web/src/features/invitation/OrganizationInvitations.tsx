import { Mail } from 'lucide-react';
import { useParams } from 'react-router-dom';

import ConfirmDialog from '../../ui/ConfirmDialog';
import Modal from '../../ui/Modal';
import { Button } from '../../ui/Button';

import {
  useOrganizationInvitations,
  useRevokeInvitation,
} from '../../hooks/useInvitations';
import { useMyMembership } from '../../hooks/useOrganizations';

function OrganizationInvitations() {
  const { organizationId } = useParams<{ organizationId: string }>();

  const { data: currentUserMember, isPending: isLoadingMembership } =
    useMyMembership(organizationId);

  const currentUserRole = currentUserMember?.role;

  const canViewInvitations =
    currentUserRole === 'owner' || currentUserRole === 'manager';

  const {
    data: invitations = [],
    isLoading,
    isError,
    error,
  } = useOrganizationInvitations(canViewInvitations ? organizationId : '');

  const revokeMutation = useRevokeInvitation(organizationId as string);

  const count = invitations.length;

  if (isLoading && isLoadingMembership) {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary/10 via-surface to-surface px-8 py-8 shadow-sm">
          <div className="space-y-2">
            <div className="h-8 w-36 animate-pulse rounded bg-muted" />
            <div className="h-4 w-72 max-w-full animate-pulse rounded bg-muted" />
          </div>
        </div>

        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-5">
              <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!canViewInvitations) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
        <p className="text-sm font-medium text-red-500">
          You do not have permission to view organization invitations.
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
        <p className="text-sm font-medium text-red-500">{error.message} </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary/10 via-surface to-surface px-8 py-8 shadow-sm">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-primary">
                Invitations
              </h1>

              {count > 0 && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {count}
                </span>
              )}
            </div>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Manage invitations sent to people you want to add to this
              organization.
            </p>
          </div>
        </div>
      </section>

      {/* List / Empty */}
      {count === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-5 w-5" />
          </span>

          <h2 className="mt-4 font-semibold text-primary">No invitations</h2>

          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            No invitations have been sent to this organization.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          {invitations.map((invitation) => {
            const isPending = invitation.status === 'pending';

            return (
              <div
                key={invitation.id}
                className="flex flex-col gap-4 p-5 transition-colors hover:bg-surface-hover sm:flex-row sm:items-center sm:justify-between"
              >
                {/* User */}
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Mail className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-medium text-primary">
                      {invitation.invitedUser.firstName}{' '}
                      {invitation.invitedUser.lastName}
                    </p>

                    <p className="truncate text-sm text-muted-foreground">
                      {invitation.invitedUser.email}
                    </p>
                  </div>
                </div>

                {/* Metadata & Actions */}
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                    {invitation.role}
                  </span>

                  <InvitationStatus status={invitation.status} />

                  {isPending && (
                    <Modal.Open opens={`revoke-${invitation.id}`}>
                      <Button type="button" variant="danger-ghost" size="xs">
                        Cancel
                      </Button>
                    </Modal.Open>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation dialogs */}
      {invitations.map((invitation) => (
        <Modal.Window
          key={`revoke-${invitation.id}`}
          name={`revoke-${invitation.id}`}
        >
          <ConfirmDialog
            title="Cancel invitation?"
            description={`Are you sure you want to cancel the invitation sent to ${invitation.invitedUser.email}?`}
            onConfirm={() => revokeMutation.mutate(invitation.id)}
            confirmLabel="Cancel invitation"
            cancelLabel="Keep invitation"
            disabled={revokeMutation.isPending}
          />
        </Modal.Window>
      ))}
    </div>
  );
}

function InvitationStatus({ status }: { status: string }) {
  const styles = {
    pending: 'bg-warning/10 text-warning',
    accepted: 'bg-success/10 text-success',
    declined: 'bg-danger/10 text-danger',
    revoked: 'bg-muted text-muted-foreground',
  };

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        styles[status as keyof typeof styles] ??
        'bg-muted text-muted-foreground'
      }`}
    >
      {status}
    </span>
  );
}

export default OrganizationInvitations;
