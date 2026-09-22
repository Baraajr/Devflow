import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, UserPlus, LogOut, UserCog, Trash2 } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import {
  useLeaveOrganization,
  useOrganization,
  useOrganizationMembers,
  useRemoveOrganizationMember,
} from '../../hooks/useOrganizations';

import { Button } from '../../ui/Button';
import Modal from '../../ui/Modal';
import ConfirmDialog from '../../ui/ConfirmDialog';
import MemberRow from '../../ui/MemberRow';

import InviteUserForm from '../invitation/InviteUserForm';
import ChangeMemberRoleForm from './ChangeMemberRoleForm';

import type { OrganizationRole } from '../../types/organization';

type SelectedMember = {
  userId: string;
  name: string;
  role: OrganizationRole;
};

function OrganizationMembers() {
  const { organizationId } = useParams<{
    organizationId: string;
  }>();

  const { user } = useAuth();

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

  const { mutate: removeMember, isPending: isRemoving } =
    useRemoveOrganizationMember();

  const { mutate: leaveOrg, isPending: isLeaving } = useLeaveOrganization();

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

  if (isLoadingOrganization || isLoadingMembers) {
    return <MembersPageSkeleton />;
  }

  if (membersError) {
    return (
      <div className="rounded-lg border border-danger/20 bg-danger/5 p-6">
        <p className="text-sm font-medium text-danger">
          Failed to load organization members.
        </p>
      </div>
    );
  }

  return (
    <Modal>
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {organization?.name}
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Members
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Manage the people who have access to this organization.
            </p>
          </div>

          {isOwner && (
            <Modal.Open opens="invite-member">
              <Button className="shrink-0">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite member
              </Button>
            </Modal.Open>
          )}
        </div>

        {/* Search / count */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="search"
              placeholder="Search members..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 w-full rounded-md border bg-surface pl-9 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {filteredMembers.length}
            </span>{' '}
            {filteredMembers.length === 1 ? 'member' : 'members'}
          </p>
        </div>

        {/* Members list */}
        <div className="overflow-hidden rounded-lg border bg-surface">
          {filteredMembers.length === 0 ? (
            <EmptyMembersState search={search} />
          ) : (
            <div className="divide-y divide-border">
              {filteredMembers.map((member) => {
                const fullName =
                  `${member.user.firstName} ${member.user.lastName}`.trim();

                const canManage =
                  isOwner ||
                  (isManager &&
                    member.role !== 'owner' &&
                    member.role !== 'manager');

                const isCurrentUser = member.userId === user?.id;

                const selectMember = () => {
                  setSelectedMember({
                    userId: member.userId,
                    name: fullName,
                    role: member.role,
                  });
                };

                return (
                  <MemberRow
                    key={member.userId}
                    name={fullName}
                    email={member.user.email}
                    role={member.role}
                    profileImage={member.user.profileImage}
                    isCurrentUser={isCurrentUser}
                    actions={
                      canManage && !isCurrentUser ? (
                        <MemberActions
                          onChangeRole={selectMember}
                          onRemove={selectMember}
                        />
                      ) : null
                    }
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Leave organization */}
        {!isOwner && (
          <div className="mt-6 flex flex-col gap-4 rounded-lg border border-danger/20 bg-danger/5 p-5 sm:flex-row sm:items-center sm:justify-between">
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

        {/* Invite */}
        <Modal.Window name="invite-member">
          {organizationId && <InviteUserForm orgId={organizationId} />}
        </Modal.Window>

        {/* Change role */}
        <Modal.Window name="change-member-role">
          {selectedMember && organizationId && (
            <ChangeMemberRoleForm
              organizationId={organizationId}
              userId={selectedMember.userId}
              currentRole={selectedMember.role}
            />
          )}
        </Modal.Window>

        {/* Remove */}
        <Modal.Window name="remove-member">
          {selectedMember && (
            <ConfirmDialog
              title="Remove member?"
              description={`Are you sure you want to remove ${selectedMember.name} from this organization?`}
              confirmLabel="Remove member"
              cancelLabel="Keep member"
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

        {/* Leave */}
        <Modal.Window name="leave-organization">
          {organization?.name && organizationId && (
            <ConfirmDialog
              title="Leave organization?"
              description={`Are you sure you want to leave ${organization.name}? You will lose access to this organization's projects, issues, and members.`}
              confirmLabel="Leave organization"
              cancelLabel="Stay"
              onConfirm={() => leaveOrg(organizationId)}
              disabled={isLeaving}
            />
          )}
        </Modal.Window>
      </div>
    </Modal>
  );
}

function MemberActions({
  onChangeRole,
  onRemove,
}: {
  onChangeRole: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <Modal.Open opens="change-member-role">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onChangeRole}
          className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
        >
          <UserCog className="h-4 w-4" />
        </Button>
      </Modal.Open>

      <Modal.Open opens="remove-member">
        <Button
          variant="ghost"
          type="button"
          size="sm"
          onClick={onRemove}
          className="text-muted-foreground hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </Modal.Open>
    </div>
  );
}

function EmptyMembersState({ search }: { search: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Search className="h-5 w-5" />
      </div>

      <h3 className="mt-4 font-medium">
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

function MembersPageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
      <div className="space-y-2">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-muted" />
      </div>

      <div className="h-10 w-full max-w-sm animate-pulse rounded-md bg-muted" />

      <div className="overflow-hidden rounded-lg border bg-surface">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 border-b border-border p-4 last:border-b-0"
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

export default OrganizationMembers;
