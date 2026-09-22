import { useLocation, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Pencil, Trash2, UserCog } from 'lucide-react';

import Modal from '../../ui/Modal';
import ConfirmDialog from '../../ui/ConfirmDialog';
import MemberRow from '../../ui/MemberRow';
import { Spinner } from '../../ui/Spinner';

import UpdateProjectForm from './UpdateProjectForm';
import AddProjectMemberForm from './AddProjectMemberForm';
import ChangeMemberRoleForm from './ChangeMemberRoleForm';

import {
  useDeleteProject,
  useProject,
  useProjectMembers,
  useRemoveProjectMember,
} from '../../hooks/useProjects';

import type { ProjectMember } from '../../types/project';
import { Button } from '../../ui/Button';
import { Tooltip } from '../../ui/Tooltip';
import { useOrganizationMembers } from '../../hooks/useOrganizations';

function Project() {
  const { organizationId: routeOrganizationId } = useParams();
  const location = useLocation();

  const organizationId = routeOrganizationId ?? 'Unknown';
  const projectId = location.state?.projectId || 'Unknown';

  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(
    null,
  );

  const { data: orgMembers } = useOrganizationMembers(organizationId);

  const {
    data: project,
    isPending: isProjectPending,
    isError: isProjectError,
  } = useProject(projectId);

  const { mutate: deleteProject, isPending: isDeletingProject } =
    useDeleteProject(organizationId, projectId);

  const {
    data: projectMembers,
    isPending: isMembersPending,
    isError: isMembersError,
  } = useProjectMembers(projectId);

  const { mutate: removeMember, isPending: isRemovingMember } =
    useRemoveProjectMember(projectId);

  if (isProjectPending) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isProjectError) {
    return (
      <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">Failed to load project.</p>
      </div>
    );
  }

  return (
    <Modal>
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Project Overview
            </h1>

            <p className="text-sm text-gray-500">
              Viewing details for project ID:
              <span className="font-mono">{project.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip position="bottom-left" text="edit project">
              <Modal.Open opens="update-project">
                <Button
                  variant="ghost"
                  type="button"
                  title="Update Project"
                  className="cursor-pointer rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary-600"
                >
                  <Pencil className="h-5 w-5" />
                </Button>
              </Modal.Open>
            </Tooltip>
            <Tooltip position="bottom-left" text="delete project">
              <Modal.Open opens="delete-project">
                <Button
                  variant="ghost"
                  type="button"
                  title="Delete Project"
                  className="cursor-pointer rounded-lg p-2 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </Modal.Open>
            </Tooltip>
          </div>
        </div>

        {/* Project Stats */}
        {/* Project Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="mt-1 text-lg font-semibold text-success">Active</p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              Tasks Completed
            </p>
            <p className="mt-1 text-lg font-semibold text-primary">12 / 18</p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              Due Date
            </p>
            <p className="mt-1 text-lg font-semibold text-primary">
              Oct 31, 2026
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3 rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            Project Description
          </h2>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {project.description || 'No description provided.'}
          </p>
        </div>

        {/* Project Members */}
        <section className="space-y-4">
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
                        <ProjectMemberActions
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
        </section>
      </div>

      {/* Update Project */}
      <Modal.Window name="update-project">
        <UpdateProjectForm
          organizationId={organizationId}
          projectId={projectId}
        />
      </Modal.Window>

      {/* Delete Project */}
      <Modal.Window name="delete-project">
        <ConfirmDialog
          title={`Delete Project? ${project.name}`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={deleteProject}
          disabled={isDeletingProject}
        />
      </Modal.Window>

      {/* Add Project Member */}
      <Modal.Window name="add-proj-member">
        <AddProjectMemberForm
          orgMembers={orgMembers ?? []}
          projectId={project.id}
        />
      </Modal.Window>

      {/* Update Member Role */}
      <Modal.Window name="update-member-role">
        {selectedMember ? (
          <ChangeMemberRoleForm
            projectId={projectId}
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

            removeMember(selectedMember.user.id);
          }}
          disabled={isRemovingMember}
        />
      </Modal.Window>
    </Modal>
  );
}

export default Project;

type ProjectMemberActionsProps = {
  onChangeRole: () => void;
  onRemove: () => void;
};

function ProjectMemberActions({
  onChangeRole,
  onRemove,
}: ProjectMemberActionsProps) {
  return (
    <div className="flex items-center gap-1 overflow-visible">
      <Modal.Open opens="update-member-role">
        <Button
          variant="ghost"
          title="change role"
          size="sm"
          type="button"
          onClick={onChangeRole}
          className="cursor-pointer rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary-600"
        >
          <UserCog className="h-5 w-5" />
        </Button>
      </Modal.Open>

      <Modal.Open opens="delete-member">
        <Button
          variant="ghost"
          title="remove member"
          type="button"
          onClick={onRemove}
          className="cursor-pointer rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </Modal.Open>
    </div>
  );
}

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
