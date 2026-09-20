import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, UserPlus, LogOut } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from '../hooks/useAuth';
import { useOrganization } from '../hooks/useOrganization';
import { useOrganizationMembers } from '../hooks/useOrganizationMembers';

import { Button } from '../ui/Button';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';

import InviteUserForm from '../features/invitation/InviteUserForm';
import ChangeMemberRoleForm from '../features/organization/ChangeMemberRoleForm';

import {
  leaveOrganization,
  removeOrganizationMember,
} from '../services/organization.service';

type OrganizationRole = 'owner' | 'manager' | 'developer' | 'viewer';

type SelectedMember = {
  userId: string;
  name: string;
  role: OrganizationRole;
};

function OrganizationMembersPage() {
  const { organizationId } = useParams<{
    organizationId: string;
  }>();

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<SelectedMember | null>(
    null,
  );

  const { data: organization, isPending: isLoadingOrganization } =
    useOrganization(organizationId);

  const {
    data: members,
    isPending: isLoadingMembers,
    isError: membersError,
  } = useOrganizationMembers(organizationId);

  const currentUserMember = members?.find(
    (member) => member.userId === user?.id,
  );

  const currentUserRole = currentUserMember?.role;

  const isOwner = currentUserRole === 'owner';
  const isManager = currentUserRole === 'manager';

  const filteredMembers = useMemo(() => {
    if (!members) return [];

    const query = search.trim().toLowerCase();

    if (!query) return members;

    return members.filter((member) => {
      const fullName =
        `${member.user.firstName} ${member.user.lastName}`.toLowerCase();

      return (
        fullName.includes(query) ||
        member.user.email.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query)
      );
    });
  }, [members, search]);

  const { mutate: removeMember, isPending: isRemoving } = useMutation({
    mutationFn: ({
      organizationId,
      userId,
    }: {
      organizationId: string;
      userId: string;
    }) => removeOrganizationMember(organizationId, userId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['organization', organizationId],
      });

      setSelectedMember(null);

      toast.success('Member removed successfully');
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: leaveOrg, isPending: isLeaving } = useMutation({
    mutationFn: leaveOrganization,

    onSuccess: async () => {
      toast.success('You left the organization');

      await queryClient.invalidateQueries({
        queryKey: ['organizations'],
      });

      window.location.href = '/organizations';
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoadingOrganization || isLoadingMembers) {
    return <MembersPageSkeleton />;
  }

  if (membersError) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-sm text-destructive">
          Failed to load organization members.
        </p>
      </div>
    );
  }

  return (
    <Modal>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {organization?.name}
            </p>

            <h1 className="text-2xl font-semibold tracking-tight">Members</h1>

            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Manage the people who have access to this organization.
            </p>
          </div>

          {isOwner && (
            <Modal.Open opens="invite-member">
              <Button className="w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite member
              </Button>
            </Modal.Open>
          )}
        </div>

        {/* Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="search"
              placeholder="Search members..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            />
          </div>

          <p className="text-sm text-muted-foreground">
            {filteredMembers.length}{' '}
            {filteredMembers.length === 1 ? 'member' : 'members'}
          </p>
        </div>

        {/* Members */}
        <div className="overflow-hidden rounded-xl border bg-card">
          {filteredMembers.length === 0 ? (
            <EmptyMembersState search={search} />
          ) : (
            <div className="divide-y">
              {filteredMembers.map((member) => {
                const fullName = `${member.user.firstName} ${member.user.lastName}`;

                const canManage =
                  isOwner ||
                  (isManager &&
                    member.role !== 'owner' &&
                    member.role !== 'manager');

                const isCurrentUser = member.userId === user?.id;

                return (
                  <MemberRow
                    key={member.userId}
                    member={member}
                    fullName={fullName}
                    isCurrentUser={isCurrentUser}
                    canManage={canManage}
                    onChangeRole={() =>
                      setSelectedMember({
                        userId: member.userId,
                        name: fullName,
                        role: member.role,
                      })
                    }
                    onRemove={() =>
                      setSelectedMember({
                        userId: member.userId,
                        name: fullName,
                        role: member.role,
                      })
                    }
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Leave organization */}
        {!isOwner && (
          <div className="flex flex-col gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Leave organization</p>

              <p className="mt-1 text-sm text-muted-foreground">
                You will lose access to this organization.
              </p>
            </div>

            <Modal.Open opens="leave-organization">
              <Button variant="danger" className="w-full sm:w-auto">
                <LogOut className="mr-2 h-4 w-4" />
                Leave
              </Button>
            </Modal.Open>
          </div>
        )}

        {/* Invite member */}
        <Modal.Window name="invite-member">
          {organizationId && <InviteUserForm orgId={organizationId} />}
        </Modal.Window>

        {/* Change member role */}
        <Modal.Window name="change-member-role">
          {selectedMember && organizationId && (
            <ChangeMemberRoleForm
              organizationId={organizationId}
              userId={selectedMember.userId}
              currentRole={selectedMember.role}
            />
          )}
        </Modal.Window>

        {/* Remove member */}
        <Modal.Window name="remove-member">
          {selectedMember && (
            <ConfirmDialog
              resourceName={selectedMember.name}
              onConfirm={() => {
                if (!organizationId) return;

                removeMember({
                  organizationId,
                  userId: selectedMember.userId,
                });
              }}
              disabled={isRemoving}
            />
          )}
        </Modal.Window>

        {/* Leave organization */}
        <Modal.Window name="leave-organization">
          {organization?.name && organizationId && (
            <ConfirmDialog
              resourceName={organization.name}
              onConfirm={() => leaveOrg(organizationId)}
              disabled={isLeaving}
            />
          )}
        </Modal.Window>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* Role Badge                                                                  */
/* -------------------------------------------------------------------------- */

function RoleBadge({ role }: { role: OrganizationRole }) {
  const labels: Record<OrganizationRole, string> = {
    owner: 'Owner',
    manager: 'Manager',
    developer: 'Developer',
    viewer: 'Viewer',
  };

  return (
    <span className="rounded-full border px-2.5 py-1 text-xs font-medium">
      {labels[role]}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Member Row                                                                  */
/* -------------------------------------------------------------------------- */

function MemberRow({
  member,
  fullName,
  isCurrentUser,
  canManage,
  onChangeRole,
  onRemove,
}: {
  member: {
    userId: string;
    role: OrganizationRole;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      profileImage?: string | null;
    };
  };
  fullName: string;
  isCurrentUser: boolean;
  canManage: boolean;
  onChangeRole: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="p-4 transition hover:bg-muted/30">
      {/* Desktop */}
      <div className="hidden items-center justify-between gap-4 sm:flex">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            firstName={member.user.firstName}
            lastName={member.user.lastName}
            profileImage={member.user.profileImage}
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{fullName}</p>

              {isCurrentUser && (
                <span className="text-xs text-muted-foreground">You</span>
              )}
            </div>

            <p className="truncate text-sm text-muted-foreground">
              {member.user.email}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <RoleBadge role={member.role} />

          {canManage && !isCurrentUser && (
            <MemberActions onChangeRole={onChangeRole} onRemove={onRemove} />
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-4 sm:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar
              firstName={member.user.firstName}
              lastName={member.user.lastName}
              profileImage={member.user.profileImage}
            />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{fullName}</p>

                {isCurrentUser && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    You
                  </span>
                )}
              </div>

              <p className="truncate text-sm text-muted-foreground">
                {member.user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <RoleBadge role={member.role} />

          {canManage && !isCurrentUser && (
            <MemberActions onChangeRole={onChangeRole} onRemove={onRemove} />
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Member Actions                                                              */
/* -------------------------------------------------------------------------- */

function MemberActions({
  onChangeRole,
  onRemove,
}: {
  onChangeRole: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Modal.Open opens="change-member-role">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onChangeRole}
        >
          Change role
        </Button>
      </Modal.Open>

      <Modal.Open opens="remove-member">
        <Button type="button" variant="danger" size="sm" onClick={onRemove}>
          Remove
        </Button>
      </Modal.Open>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Avatar                                                                      */
/* -------------------------------------------------------------------------- */

function Avatar({
  firstName,
  lastName,
  profileImage,
}: {
  firstName: string;
  lastName: string;
  profileImage?: string | null;
}) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  if (profileImage) {
    return (
      <img
        src={profileImage}
        alt={`${firstName} ${lastName}`}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
      {initials}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty State                                                                 */
/* -------------------------------------------------------------------------- */

function EmptyMembersState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>

      <h3 className="font-medium">
        {search ? 'No members found' : 'No members'}
      </h3>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {search
          ? 'Try adjusting your search.'
          : 'There are no members in this organization.'}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Loading                                                                     */
/* -------------------------------------------------------------------------- */

function MembersPageSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="space-y-2">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-muted" />
      </div>

      <div className="h-10 w-full max-w-sm animate-pulse rounded-md bg-muted" />

      <div className="overflow-hidden rounded-xl border">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 border-b p-4 last:border-b-0"
          >
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-3 w-48 animate-pulse rounded bg-muted" />
            </div>

            <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrganizationMembersPage;
