import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Plus, Users } from 'lucide-react';

import Modal from '../../ui/Modal';
import ConfirmDialog from '../../ui/ConfirmDialog';
import MemberRow from '../../ui/MemberRow';
import { Button } from '../../ui/Button';
import MemberActions from '../../ui/MemberActions';
import { useModal } from '../../ui/ModalContext';

import AddProjectMemberForm from './AddProjectMemberForm';
import ChangeMemberRoleForm from './ChangeMemberRoleForm';

import {
  useProjectMembers,
  useRemoveProjectMember,
} from '../../hooks/useProjects';
import { useOrganizationMembers } from '../../hooks/useOrganizations';

import type { ProjectMember } from '../../types/project';

function ProjectMembers() {
  const { close } = useModal();

  const { organizationId, projectId } = useParams<{
    organizationId: string;
    projectId: string;
  }>();

  const { data: orgMembers } = useOrganizationMembers(organizationId);

  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(
    null,
  );

  const { mutate: removeMember, isPending: isRemovingMember } =
    useRemoveProjectMember(projectId!);

  const {
    data: projectMembers,
    isPending: isMembersPending,
    isError: isMembersError,
  } = useProjectMembers(projectId);

  const count = projectMembers?.length ?? 0;

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

              {!isMembersPending && !isMembersError && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {count}
                </span>
              )}
            </div>

            <p className="mt-1.5 text-sm text-muted-foreground">
              People collaborating on this project.
            </p>
          </div>

          <Modal.Open opens="add-proj-member">
            <Button type="button">
              <Plus size={18} />
              Add member
            </Button>
          </Modal.Open>
        </div>
      </section>

      {/* List */}
      {isMembersPending ? (
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
      ) : isMembersError ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <p className="text-sm font-medium text-red-500">
            Failed to load project members.
          </p>
        </div>
      ) : count === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </span>

          <h2 className="mt-4 font-semibold text-primary">No members yet</h2>

          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            There are no members assigned to this project.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          {projectMembers.map((member) => {
            const name =
              `${member.user?.firstName ?? ''} ${
                member.user?.lastName ?? ''
              }`.trim() || 'Unknown Member';

            const email = member.user?.email ?? 'No email provided';

            return (
              <MemberRow
                key={member.user.id}
                name={name}
                email={email}
                role={member.role}
                profileImage={member.user?.profileImage}
                actions={
                  <MemberActions
                    changeRoleModal="update-member-role"
                    removeModal="delete-member"
                    onChangeRole={() => setSelectedMember(member)}
                    onRemove={() => setSelectedMember(member)}
                  />
                }
              />
            );
          })}
        </div>
      )}

      {/* Modals */}
      <Modal.Window name="add-proj-member">
        <AddProjectMemberForm
          orgMembers={orgMembers ?? []}
          projectId={projectId!}
        />
      </Modal.Window>

      <Modal.Window name="update-member-role">
        {selectedMember ? (
          <ChangeMemberRoleForm
            projectId={projectId!}
            userId={selectedMember.user.id}
            currentRole={selectedMember.role}
          />
        ) : null}
      </Modal.Window>

      <Modal.Window name="delete-member">
        <ConfirmDialog
          title={`Remove ${
            selectedMember?.user?.firstName || 'member'
          } from project?`}
          confirmLabel="Remove"
          cancelLabel="Cancel"
          onConfirm={() => {
            if (!selectedMember) return;

            removeMember(selectedMember.user.id, {
              onSuccess: () => {
                close();
                setSelectedMember(null);
              },
            });
          }}
          disabled={isRemovingMember}
        />
      </Modal.Window>
    </div>
  );
}

export default ProjectMembers;
