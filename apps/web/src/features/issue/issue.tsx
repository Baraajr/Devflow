import { UserPlus, Pencil, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useDeleteIssue, useIssue } from '../../hooks/useIssues';
import { useProject, useProjectMembers } from '../../hooks/useProjects';

import { Button } from '../../ui/Button';
import ConfirmDialog from '../../ui/ConfirmDialog';
import Modal from '../../ui/Modal';
import { Tooltip } from '../../ui/Tooltip';

import AssignIssueForm from './AssignIssueForm';
import UpdateIssueForm from './UpdateIssueForm';

function IssuePage() {
  const { organizationId, projectId, issueId } = useParams();

  const {
    data: projectMembers,
    isPending: isMembersPending,
    isError: isMembersError,
  } = useProjectMembers(projectId);

  const navigate = useNavigate();

  const { data: project, isLoading: isProjectLoading } = useProject(projectId);

  const {
    data: issue,
    isLoading: isIssueLoading,
    isError,
    error,
  } = useIssue(projectId ?? '', issueId ?? '');

  const deleteIssue = useDeleteIssue(projectId ?? '');

  const handleDelete = () => {
    if (!issue) return;

    deleteIssue.mutate(issue.id, {
      onSuccess: () => {
        navigate(
          `/organizations/${organizationId}/projects/${projectId}/issues`,
        );
      },
    });
  };

  if (isProjectLoading || isIssueLoading) {
    return <div className="p-6">Loading issue...</div>;
  }

  if (isError) {
    return (
      <div className="space-y-3 p-6">
        <p className="text-red-500">{error.message}</p>

        <Link
          to={`/organizations/${organizationId}/projects/${projectId}/issues`}
        >
          <Button variant="ghost">Back to issues</Button>
        </Link>
      </div>
    );
  }

  if (!issue || !project) {
    return <div className="p-6">Issue not found.</div>;
  }

  return (
    <Modal>
      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {project.key}-{issue.issueNumber}
            </p>

            <h1 className="mt-1 text-2xl font-semibold text-primary">
              {issue.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-md border border-border px-3 py-1 text-sm">
              {issue.status}
            </span>

            <span className="rounded-md border border-border px-3 py-1 text-sm">
              {issue.priority}
            </span>

            <Tooltip position="bottom-left" text="Assign issue">
              <Modal.Open opens="assign-issue">
                <Button
                  variant="ghost"
                  type="button"
                  title="Assign issue"
                  className="cursor-pointer rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary-600"
                >
                  <UserPlus className="h-5 w-5" />
                </Button>
              </Modal.Open>
            </Tooltip>

            <Tooltip position="bottom-left" text="Edit issue">
              <Modal.Open opens="update-issue">
                <Button
                  variant="ghost"
                  type="button"
                  title="Update issue"
                  className="cursor-pointer rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary-600"
                >
                  <Pencil className="h-5 w-5" />
                </Button>
              </Modal.Open>
            </Tooltip>

            <Tooltip position="bottom-left" text="Delete issue">
              <Modal.Open opens="delete-issue">
                <Button
                  variant="ghost"
                  type="button"
                  title="Delete issue"
                  className="cursor-pointer rounded-lg p-2 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </Modal.Open>
            </Tooltip>
          </div>
        </div>

        <Modal.Window name="assign-issue">
          {isMembersPending ? (
            <div className="p-6">Loading members...</div>
          ) : isMembersError ? (
            <div className="p-6 text-sm text-red-500">
              Failed to load project members.
            </div>
          ) : (
            <AssignIssueForm
              projectId={projectId!}
              issueId={issue.id}
              projectMembers={projectMembers ?? []}
            />
          )}
        </Modal.Window>

        <Modal.Window name="update-issue">
          <UpdateIssueForm
            projectId={projectId!}
            issueId={issue.id}
            defaultValues={{
              title: issue.title,
              description: issue.description ?? '',
              issueType: issue.issueType,
              status: issue.status,
              priority: issue.priority,
              assigneeId: issue.assigneeId,
              parentIssueId: issue.parentIssueId,
            }}
          />
        </Modal.Window>

        <Modal.Window name="delete-issue">
          <ConfirmDialog
            resourceName="issue"
            description="This issue will be permanently deleted."
            onConfirm={handleDelete}
            disabled={deleteIssue.isPending}
          />
        </Modal.Window>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <section className="rounded-lg border border-border p-6">
            <h2 className="text-sm font-semibold text-primary">Description</h2>

            <div className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">
              {issue.description || 'No description provided.'}
            </div>
          </section>

          <aside className="space-y-4 rounded-lg border border-border p-6">
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="mt-1 text-sm text-primary">{issue.issueType}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Reporter</p>

              <div className="mt-2 flex items-center gap-3">
                {issue.reporter.profileImage ? (
                  <img
                    src={issue.reporter.profileImage}
                    alt={issue.reporter.firstName}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
                    {issue.reporter.firstName.charAt(0).toUpperCase()}
                    {issue.reporter.lastName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary">
                    {issue.reporter.firstName} {issue.reporter.lastName}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    {issue.reporter.email}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Assignee</p>

              {issue.assignee ? (
                <div className="mt-2 flex items-center gap-3">
                  {issue.assignee.profileImage ? (
                    <img
                      src={issue.assignee.profileImage}
                      alt={issue.assignee.firstName}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
                      {issue.assignee.firstName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary">
                      {issue.assignee.firstName}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      {issue.assignee.email}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Unassigned</p>
              )}
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="mt-1 text-sm text-primary">
                {new Date(issue.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Updated</p>
              <p className="mt-1 text-sm text-primary">
                {new Date(issue.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </Modal>
  );
}

export default IssuePage;
