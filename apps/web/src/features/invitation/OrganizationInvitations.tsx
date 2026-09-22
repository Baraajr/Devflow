import { Mail } from 'lucide-react';
import { useParams } from 'react-router-dom';

import ConfirmDialog from '../../ui/ConfirmDialog';
import Modal from '../../ui/Modal';
import { Button } from '../../ui/Button';

import {
  useOrganizationInvitations,
  useRevokeInvitation,
} from '../../hooks/useInvitations';

function OrganizationInvitations() {
  const { organizationId } = useParams<{ organizationId: string }>();

  const {
    data: invitations = [],
    isLoading,
    isError,
  } = useOrganizationInvitations(organizationId);

  const revokeMutation = useRevokeInvitation(organizationId as string);

  if (isLoading) {
    return <InvitationSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-danger/20 bg-danger/5 p-6">
        <p className="text-sm font-medium text-danger">
          Failed to load invitations.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>Organization</span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">Invitations</h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Manage invitations sent to people you want to add to this
          organization.
        </p>
      </div>

      {/* Empty */}
      {invitations.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed bg-surface px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Mail className="h-5 w-5" />
          </div>

          <h2 className="mt-4 font-medium">No invitations</h2>

          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            No invitations have been sent to this organization.
          </p>
        </div>
      ) : (
        <>
          {/* Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {invitations.length}{' '}
              {invitations.length === 1 ? 'invitation' : 'invitations'}
            </p>
          </div>

          {/* Invitations */}
          <div className="overflow-hidden rounded-lg border bg-surface">
            <div className="divide-y divide-border">
              {invitations.map((invitation) => {
                const isPending = invitation.status === 'pending';

                return (
                  <div
                    key={invitation.id}
                    className="flex flex-col gap-4 p-4 transition-colors hover:bg-surface-hover sm:flex-row sm:items-center sm:justify-between"
                  >
                    {/* User */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Mail className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {invitation.invitedUser.firstName}{' '}
                          {invitation.invitedUser.lastName}
                        </p>

                        <p className="truncate text-sm text-muted-foreground">
                          {invitation.invitedUser.email}
                        </p>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium capitalize text-muted-foreground">
                        {invitation.role}
                      </span>

                      <InvitationStatus status={invitation.status} />

                      {isPending && (
                        <Modal.Open opens={`revoke-${invitation.id}`}>
                          <Button
                            type="button"
                            variant="danger-ghost"
                            size="xs"
                          >
                            Cancel
                          </Button>
                        </Modal.Open>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
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
      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        styles[status as keyof typeof styles] ??
        'bg-muted text-muted-foreground'
      }`}
    >
      {status}
    </span>
  );
}

function InvitationSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 lg:p-8">
      <div className="space-y-2">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-8 w-36 animate-pulse rounded bg-muted" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-muted" />
      </div>

      <div className="overflow-hidden rounded-lg border bg-surface">
        <div className="divide-y divide-border">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted" />

                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-48 animate-pulse rounded bg-muted" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-6 w-20 animate-pulse rounded-md bg-muted" />
                <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                <div className="h-8 w-20 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrganizationInvitations;
