import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useModal } from '../../ui/ModalContext';
import {
  getOrganizationInvitations,
  revokeInvitation,
} from '../../services/invitation.service';
import ConfirmDialog from '../../ui/ConfirmDialog';
import Modal from '../../ui/Modal';
import { Button } from '../../ui/Button';

function OrganizationInvitationsContent() {
  const { close } = useModal();
  const { organizationId } = useParams<{ organizationId: string }>();
  const queryClient = useQueryClient();

  const {
    data: invitations = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['organization', organizationId, 'invitations'],
    queryFn: () => getOrganizationInvitations(organizationId!),
    enabled: !!organizationId,
  });

  const revokeMutation = useMutation({
    mutationFn: (invitationId: string) => revokeInvitation(invitationId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['organization', organizationId, 'invitations'],
      });

      toast.success('Invitation cancelled');
      close();
    },

    onError: (err) => {
      toast.error(err.message);
    },
  });

  if (isLoading) {
    return <InvitationSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">Failed to load invitations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Invitations</h1>

        <p className="text-sm text-muted-foreground">
          Manage invitations sent to organization members.
        </p>
      </div>

      {invitations.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <Mail className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

          <h2 className="font-medium">No invitations</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            No invitations have been sent to this organization.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <div className="divide-y">
            {invitations.map((invitation) => {
              const isPending = invitation.status === 'pending';

              return (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Mail className="h-5 w-5 text-muted-foreground" />
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

                  <div className="flex shrink-0 items-center gap-4">
                    <span className="text-sm capitalize text-muted-foreground">
                      {invitation.role}
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                        invitation.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : invitation.status === 'accepted'
                            ? 'bg-green-100 text-green-700'
                            : invitation.status === 'declined'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {invitation.status}
                    </span>

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
        </div>
      )}

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

function InvitationSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded bg-muted" />
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="divide-y">
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

              <div className="flex items-center gap-4">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
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
export default OrganizationInvitationsContent;
