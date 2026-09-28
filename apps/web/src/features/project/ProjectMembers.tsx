import { useParams } from 'react-router-dom';
import { useState } from 'react';

import Modal from '../../ui/Modal';
import ConfirmDialog from '../../ui/ConfirmDialog';
import MemberRow from '../../ui/MemberRow';
import { Spinner } from '../../ui/Spinner';

import AddProjectMemberForm from './AddProjectMemberForm';
import ChangeMemberRoleForm from './ChangeMemberRoleForm';

import {
  useProjectMembers,
  useRemoveProjectMember,
} from '../../hooks/useProjects';

import type { ProjectMember } from '../../types/project';
import { Button } from '../../ui/Button';
import { useOrganizationMembers } from '../../hooks/useOrganizations';
import { useModal } from '../../ui/ModalContext';
import MemberActions from '../../ui/MemberActions';

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

  return (
    <section className="mx-auto max-w-7xl p-6 lg:p-8 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Project Members
          </h2>

          <p className="text-sm text-muted-foreground">
            People collaborating on this project.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {projectMembers?.length ?? 0}{' '}
            {projectMembers?.length === 1 ? 'member' : 'members'}
          </p>

          <Modal.Open opens="add-proj-member">
            <Button type="button">Add Member</Button>
          </Modal.Open>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {isMembersPending ? (
          <div className="flex justify-center p-8">
            <Spinner />
          </div>
        ) : isMembersError ? (
          <div className="p-6 text-center text-sm text-destructive">
            Failed to load project members.
          </div>
        ) : !projectMembers || projectMembers.length === 0 ? (
          <EmptyMembersState />
        ) : (
          <div className="divide-y ">
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
      </div>

      {/* Add Project Member */}
      <Modal.Window name="add-proj-member">
        <AddProjectMemberForm
          orgMembers={orgMembers ?? []}
          projectId={projectId!}
        />
      </Modal.Window>

      {/* Update Member Role */}
      <Modal.Window name="update-member-role">
        {selectedMember ? (
          <ChangeMemberRoleForm
            projectId={projectId!}
            userId={selectedMember.user.id}
            currentRole={selectedMember.role}
          />
        ) : null}
      </Modal.Window>

      {/* Remove Member */}
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
    </section>
  );
}
export default ProjectMembers;

function EmptyMembersState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <h3 className="font-medium text-gray-900">No members</h3>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        There are no members assigned to this project.
      </p>
    </div>
  );
}
