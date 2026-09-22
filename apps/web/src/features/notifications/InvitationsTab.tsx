import { Clock } from 'lucide-react';

import InvitationItem from './InvitationItem';
import { Spinner } from '../../ui/Spinner';
import { useInvitations } from '../../hooks/useInvitations';

function InvitationsTab() {
  const { data: invitations = [], isLoading, isError } = useInvitations();

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-destructive">Failed to load invitations.</p>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="p-6 text-center">
        <Clock className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />

        <p className="text-sm font-medium">No invitations</p>

        <p className="mt-1 text-xs text-muted-foreground">
          You don't have any organization invitations.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Invitations</h3>
      </div>

      {invitations.map((invitation) => (
        <InvitationItem key={invitation.id} invitation={invitation} />
      ))}
    </div>
  );
}

export default InvitationsTab;
