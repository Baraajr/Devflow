import { useMemo, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { LogOut, Search, ShieldAlert, UserPlus } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import {
  useLeaveOrganization,
  useMyMembership,
  useOrganizationMembers,
  useRemoveOrganizationMember,
} from '../../hooks/useOrganizations';

import { Button } from '../../ui/Button';
import Modal from '../../ui/Modal';
import ConfirmDialog from '../../ui/ConfirmDialog';
import MemberRow from '../../ui/MemberRow';
import MemberActions from '../../ui/MemberActions';
import EmptyMembersState from '../../ui/EmptyMembersState';
import { useModal } from '../../ui/ModalContext';

import InviteUserForm from '../invitation/InviteUserForm';
import ChangeMemberRoleForm from './ChangeMemberRoleForm';

import type {
  Organization,
  OrganizationMember,
  OrganizationRole,
} from '../../types/organization';

type SelectedMember = {
  userId: string;
  name: string;
  role: OrganizationRole;
};

/* ---------- Page ---------- */

function OrganizationMembers() {
  const { close } = useModal();

  const { organizationId } = useParams<{ organizationId: string }>();

  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<SelectedMember | null>(
    null,
  );

  const organization = useOutletContext<Organization>();

  const { data: currentUserMember, isPending: isLoadingMembership } =
    useMyMembership(organizationId);

  const currentUserRole = currentUserMember?.role;

  const canViewMembers =
    currentUserRole === 'owner' || currentUserRole === 'manager';

  const {
    data: members,
    isPending: isLoadingMembers,
    isError: membersError,
  } = useOrganizationMembers(canViewMembers ? organizationId : undefined);

  const { mutateAsync: removeMember, isPending: isRemoving } =
    useRemoveOrganizationMember();

  const { mutateAsync: leaveOrg, isPending: isLeaving } =
    useLeaveOrganization();

  const isOwner = currentUserRole === 'owner';
  const isManager = currentUserRole === 'manager';

  const filteredMembers = useMemo<OrganizationMember[]>(() => {
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

  if (isLoadingMembership || (canViewMembers && isLoadingMembers)) {
    return <MembersPageSkeleton />;
  }

  if (!canViewMembers) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <ShieldAlert className="h-5 w-5" />
        </span>

        <h2 className="mt-4 font-semibold text-primary">Access restricted</h2>

        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          You do not have permission to view organization members.
        </p>
      </div>
    );
  }

  if (membersError) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
        <p className="text-sm font-medium text-red-500">
          Failed to load organization members.
        </p>
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
                Members
              </h1>

              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {members?.length ?? 0}
              </span>
            </div>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Manage the people who have access to{' '}
              {organization?.name ?? 'this organization'}.
            </p>
          </div>

          {isOwner && (
            <Modal.Open opens="invite-member">
              <Button className="shrink-0">
                <UserPlus size={18} />
                Invite member
              </Button>
            </Modal.Open>
          )}
        </div>
      </section>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <input
          type="search"
          placeholder="Search members..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Members list */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
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
                        changeRoleModal="change-member-role"
                        removeModal="remove-member"
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
        <div className="flex flex-col gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              Leave organization
            </p>

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

      {/* Modals */}
      <Modal.Window name="invite-member">
        {organizationId && <InviteUserForm orgId={organizationId} />}
      </Modal.Window>

      <Modal.Window name="change-member-role">
        {selectedMember && organizationId && (
          <ChangeMemberRoleForm
            organizationId={organizationId}
            userId={selectedMember.userId}
            currentRole={selectedMember.role}
          />
        )}
      </Modal.Window>

      <Modal.Window name="remove-member">
        {selectedMember && (
          <ConfirmDialog
            title="Remove member?"
            description={`Are you sure you want to remove ${selectedMember.name} from this organization?`}
            confirmLabel="Remove member"
            cancelLabel="Keep member"
            onConfirm={async () => {
              if (!organizationId) return;

              await removeMember({
                organizationId,
                userId: selectedMember.userId,
              });

              close();
              setSelectedMember(null);
            }}
            disabled={isRemoving}
          />
        )}
      </Modal.Window>

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
  );
}

/* ---------- Skeleton ---------- */

function MembersPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-32 animate-pulse rounded-3xl bg-surface" />

      <div className="h-11 w-full max-w-md animate-pulse rounded-xl bg-surface" />

      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 p-5">
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />

            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-32 animate-pulse rounded bg-muted" />
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
