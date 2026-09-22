import { useLocation, useParams } from 'react-router-dom';
import { useState } from 'react';
import Modal from '../../ui/Modal';
import UpdateProjectForm from '../../features/project/UpdateProjectForm';
import ConfirmDialog from '../../ui/ConfirmDialog';
import {
  useDeleteProject,
  useProject,
  useProjectMembers,
  useRemoveProjectMember,
} from '../../hooks/useProjects';
import { Spinner } from '../../ui/Spinner';
import { useOrganizationMembers } from '../../hooks/useOrganizationMembers';
import AddProjectMemberForm from '../../features/project/AddProjectMemberForm';
import ChangeMemberRoleForm from './ChangeMemberRoleForm';
function ProjectPageContent() {
  const { organizationId: routeOrganizationId } = useParams();
  const location = useLocation();
  const organizationId = routeOrganizationId ?? 'Unknown';
  const projectId = location.state?.projectId || 'Unknown';

  // Track selected member for contextual modals (role updates or removal)
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const { data: orgMembers } = useOrganizationMembers(organizationId);
  const { data: project, isPending, isError } = useProject(projectId);
  const { mutate: deleteProject, isPending: isDeletingProj } = useDeleteProject(
    organizationId,
    projectId,
  );

  const {
    data: projectMembers,
    isPending: isMembersPending,
    isError: isMembersError,
  } = useProjectMembers(projectId);

  const { mutate: removeMember } = useRemoveProjectMember(projectId);

  if (isPending) return <Spinner />;
  if (isError)
    return (
      <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">Failed to load project.</p>
      </div>
    );

  return (
    <Modal>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header Section with Actions on the Top Right */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Project Overview
            </h1>
            <p className="text-sm text-gray-500">
              Viewing details for project ID:{' '}
              <span className="font-mono">{project.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Modal.Open opens="update-project">
              <button
                type="button"
                title="Update Project"
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            </Modal.Open>

            <Modal.Open opens="delete-project">
              <button
                type="button"
                title="Delete Project"
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </Modal.Open>
          </div>
        </div>

        {/* Static Content Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p className="text-lg font-semibold text-emerald-600 mt-1">
              Active
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Tasks Completed</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">12 / 18</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Due Date</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              Oct 31, 2026
            </p>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Project Description
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Project Members Section */}
        <div className="space-y-4">
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

              {/* Add Member Button wrapped in Modal.Open */}
              <Modal.Open opens="add-proj-member">
                <button
                  type="button"
                  className="px-3.5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Add Member
                </button>
              </Modal.Open>
            </div>
          </div>

          {/* Members List Container */}
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
              <div className="divide-y">
                {projectMembers.map((member) => {
                  const name =
                    `${member.user?.firstName || ''} ${member.user?.lastName || ''}`.trim() ||
                    'Unknown Member';
                  const email = member.user?.email || 'No email provided';
                  const role = member.role || 'Member';
                  const profileImage = member.user?.profileImage;

                  return (
                    <MemberRow
                      key={member.user.id}
                      name={name}
                      email={email}
                      role={role}
                      profileImage={profileImage}
                      onUpdateRole={() => setSelectedMember(member)}
                      onDelete={() => setSelectedMember(member)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Modal Windows Definitions --- */}

      {/* 1. Update Project Modal */}
      <Modal.Window name="update-project">
        <UpdateProjectForm
          organizationId={organizationId}
          projectId={projectId}
        />
      </Modal.Window>

      {/* 2. Delete Project Modal */}
      <Modal.Window name="delete-project">
        <ConfirmDialog
          title={`Delete Project? ${project?.name ?? ''}`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={() => {
            if (!projectId) return;
            deleteProject();
          }}
          disabled={isDeletingProj}
        />
      </Modal.Window>

      {/* 3. Add Project Member Modal */}
      <Modal.Window name="add-proj-member">
        <AddProjectMemberForm
          orgMembers={orgMembers ?? []}
          projectId={project.id}
        />
      </Modal.Window>

      {/* 4. Update Member Role Modal */}
      <Modal.Window name="update-member-role">
        <ChangeMemberRoleForm
          projectId={projectId}
          userId={selectedMember?.user?.id}
          currentRole={selectedMember?.role}
        />
      </Modal.Window>

      {/* 5. Remove Member Confirmation Modal */}
      <Modal.Window name="delete-member">
        <ConfirmDialog
          title={`Remove ${selectedMember?.user?.firstName || 'member'} from project?`}
          confirmLabel="Remove"
          cancelLabel="Cancel"
          onConfirm={() => {
            if (!selectedMember) return;
            removeMember(selectedMember.user.id);
          }}
        />
      </Modal.Window>
    </Modal>
  );
}

export default ProjectPageContent;

/* -------------------------------------------------------------------------- */
/* Sub-components (RoleBadge, MemberRow, Avatar, EmptyMembersState)           */
/* -------------------------------------------------------------------------- */

function RoleBadge({ role }: { role: string }) {
  return (
    <span className="rounded-full border px-2.5 py-1 text-xs font-medium capitalize">
      {role}
    </span>
  );
}

function MemberRow({
  name,
  email,
  role,
  profileImage,
  onUpdateRole,
  onDelete,
}: {
  name: string;
  email: string;
  role: string;
  profileImage?: string | null;
  onUpdateRole: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="p-4 transition hover:bg-muted/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={name} profileImage={profileImage} />
          <div className="min-w-0">
            <p className="truncate font-medium text-gray-900">{name}</p>
            <p className="truncate text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <RoleBadge role={role} />

          <div className="flex items-center gap-1">
            {/* Update Role Modal Trigger */}
            <Modal.Open opens="update-member-role">
              <button
                type="button"
                onClick={onUpdateRole}
                className="px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              >
                Update Role
              </button>
            </Modal.Open>

            {/* Delete Member Modal Trigger */}
            <Modal.Open opens="delete-member">
              <button
                type="button"
                onClick={onDelete}
                title="Remove Member"
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </Modal.Open>
          </div>
        </div>
      </div>
    </div>
  );
}

function Avatar({
  name,
  profileImage,
}: {
  name: string;
  profileImage?: string | null;
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  if (profileImage) {
    return (
      <img
        src={profileImage}
        alt={name}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-gray-700">
      {initials || 'U'}
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
