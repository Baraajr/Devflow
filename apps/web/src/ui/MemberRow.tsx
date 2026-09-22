import type { ReactNode } from 'react';

import MemberAvatar from './MemberAvatar';
import MemberRoleBadge from './MemberRoleBadge';

type MemberRowProps = {
  name: string;
  email: string;
  role: string;
  profileImage?: string | null;
  isCurrentUser?: boolean;
  actions?: ReactNode;
};

function MemberRow({
  name,
  email,
  role,
  profileImage,
  isCurrentUser = false,
  actions,
}: MemberRowProps) {
  return (
    <div className="p-4 transition hover:bg-muted/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <MemberAvatar name={name} profileImage={profileImage} />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{name}</p>

              {isCurrentUser && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  You
                </span>
              )}
            </div>

            <p className="truncate text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <MemberRoleBadge role={role} />

          {actions}
        </div>
      </div>
    </div>
  );
}

export default MemberRow;
