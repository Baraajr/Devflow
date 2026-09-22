import { Button } from '../../ui/Button';
import type { Invitation } from '../../types/invitation';
import {
  useAcceptInvitation,
  useDeclineInvitation,
} from '../../hooks/useInvitations';

interface InvitationItemProps {
  invitation: Invitation;
}

function InvitationItem({ invitation }: InvitationItemProps) {
  const acceptMutation = useAcceptInvitation();
  const declineMutation = useDeclineInvitation();

  const isPending = invitation.status === 'pending';
  const isMutating = acceptMutation.isPending || declineMutation.isPending;

  return (
    <div
      className={`border-b px-4 py-4 ${
        isPending ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">
            {invitation.organization?.name ?? 'Organization no longer exists'}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            You've been invited as{' '}
            <span className="font-medium capitalize">{invitation.role}</span>
          </p>
        </div>

        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            isPending
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {invitation.status}
        </span>
      </div>

      {isPending && (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            variant="primary"
            loading={acceptMutation.isPending}
            disabled={isMutating}
            onClick={() => acceptMutation.mutate(invitation.id)}
          >
            Accept
          </Button>

          <Button
            size="sm"
            variant="ghost"
            loading={declineMutation.isPending}
            disabled={isMutating}
            onClick={() => declineMutation.mutate(invitation.id)}
          >
            Decline
          </Button>
        </div>
      )}
    </div>
  );
}

export default InvitationItem;
