import {
  ChevronRight,
  Circle,
  Flag,
  Layers,
  Pencil,
  Tag,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useIssue, useDeleteIssue } from '../../hooks/useIssues';
import { useProject, useProjectMembers } from '../../hooks/useProjects';

import { Button } from '../../ui/Button';
import ConfirmDialog from '../../ui/ConfirmDialog';
import Modal from '../../ui/Modal';
import { Select } from '../../ui/Select';
import { Tooltip } from '../../ui/Tooltip';

import AssignIssueForm from './AssignIssueForm';
import UpdateIssueForm from './UpdateIssueForm';

import {
  useAddIssueLabel,
  useRemoveIssueLabel,
} from '../../hooks/useIssueLabels';
import { useProjectLabels } from '../../hooks/useLabels';
import Comments from '../comment/comments';
import { useAuth } from '../../hooks/useAuth';

/* ---------- Style helpers ---------- */

type Tone = { dot: string; text: string };

const NEUTRAL: Tone = {
  dot: 'bg-muted-foreground',
  text: 'text-muted-foreground',
};

const STATUS_TONES: Record<string, Tone> = {
  todo: NEUTRAL,
  in_progress: { dot: 'bg-info', text: 'text-info' },
  in_review: { dot: 'bg-primary', text: 'text-primary' },
  done: { dot: 'bg-success', text: 'text-success' },
};

const PRIORITY_TONES: Record<string, Tone> = {
  low: NEUTRAL,
  medium: { dot: 'bg-info', text: 'text-info' },
  high: { dot: 'bg-warning', text: 'text-warning' },
  critical: { dot: 'bg-danger', text: 'text-danger' },
  urgent: { dot: 'bg-danger', text: 'text-danger' },
};

function Tile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: Tone;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>

      <div className="mt-3 flex items-center gap-2.5">
        {tone && <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />}
        <p
          className={`text-lg font-semibold capitalize ${tone ? tone.text : 'text-primary'}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function Avatar({
  src,
  firstName,
  lastName,
}: {
  src?: string | null;
  firstName: string;
  lastName?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={firstName}
        className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-surface"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/50 text-xs font-semibold text-white ring-2 ring-surface">
      {firstName.charAt(0).toUpperCase()}
      {lastName?.charAt(0).toUpperCase()}
    </div>
  );
}

function Person({
  role,
  user,
}: {
  role: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string | null;
  };
}) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {role}
      </p>

      <div className="flex items-center gap-3">
        <Avatar
          src={user.profileImage}
          firstName={user.firstName}
          lastName={user.lastName}
        />

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-primary">
            {user.firstName} {user.lastName}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between gap-3 px-6 pt-5">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-semibold text-primary">{title}</h2>
        </div>
        {action}
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

/* ---------- Page ---------- */

function Issue() {
  const { user } = useAuth();
  const { organizationId, projectId, issueId } = useParams();

  const navigate = useNavigate();

  const {
    data: projectMembers,
    isPending: isMembersPending,
    isError: isMembersError,
  } = useProjectMembers(projectId);

  const { data: project, isLoading: isProjectLoading } = useProject(projectId);

  const {
    data: issue,
    isLoading: isIssueLoading,
    isError,
    error,
  } = useIssue(projectId ?? '', issueId ?? '');

  const { data: labels = [], isLoading: isLabelsLoading } = useProjectLabels(
    projectId ?? '',
  );

  const deleteIssue = useDeleteIssue(projectId ?? '');

  const addIssueLabel = useAddIssueLabel(projectId ?? '', issueId ?? '');

  const removeIssueLabel = useRemoveIssueLabel(projectId ?? '', issueId ?? '');

  const issuesPath = `/organizations/${organizationId}/projects/${projectId}/issues`;

  const handleDelete = () => {
    if (!issue) return;

    deleteIssue.mutate(issue.id, {
      onSuccess: () => {
        navigate(issuesPath);
      },
    });
  };

  const handleAddLabel = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const labelId = event.target.value;

    if (!labelId) return;

    try {
      await addIssueLabel.mutateAsync(labelId);
    } catch {
      // Error toast is already handled by the mutation.
    }

    event.target.value = '';
  };

  const handleRemoveLabel = async (labelId: string) => {
    try {
      await removeIssueLabel.mutateAsync(labelId);
    } catch {
      // Error toast is already handled by the mutation.
    }
  };

  if (isProjectLoading || isIssueLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-surface" />
        <div className="h-48 animate-pulse rounded-3xl bg-surface" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-24 animate-pulse rounded-2xl bg-surface" />
          <div className="h-24 animate-pulse rounded-2xl bg-surface" />
          <div className="h-24 animate-pulse rounded-2xl bg-surface" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6 lg:p-8">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <p className="text-sm font-medium text-red-500">{error.message}</p>
        </div>

        <Link to={issuesPath}>
          <Button variant="ghost">Back to issues</Button>
        </Link>
      </div>
    );
  }

  if (!issue || !project) {
    return (
      <div className="p-6 text-sm text-muted-foreground">Issue not found.</div>
    );
  }

  const assignedLabelIds = new Set(
    issue.labels?.map((label) => label.id) ?? [],
  );

  const availableLabels = labels.filter(
    (label) => !assignedLabelIds.has(label.id),
  );

  const statusTone = STATUS_TONES[issue.status] ?? NEUTRAL;
  const priorityTone = PRIORITY_TONES[issue.priority] ?? NEUTRAL;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to={issuesPath} className="transition hover:text-primary">
            Issues
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-mono font-medium text-primary">
            {project.key}-{issue.issueNumber}
          </span>
        </nav>

        <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1 shadow-sm">
          <Tooltip position="bottom-left" text="Assign issue">
            <Modal.Open opens="assign-issue">
              <Button variant="ghost" type="button">
                <UserPlus className="h-5 w-5" />
              </Button>
            </Modal.Open>
          </Tooltip>

          <Tooltip position="bottom-left" text="Edit issue">
            <Modal.Open opens="update-issue">
              <Button variant="ghost" type="button">
                <Pencil className="h-5 w-5" />
              </Button>
            </Modal.Open>
          </Tooltip>

          <div className="mx-1 h-5 w-px bg-border" />

          <Tooltip position="bottom-left" text="Delete issue">
            <Modal.Open opens="delete-issue">
              <Button variant="ghost" type="button">
                <Trash2 className="h-5 w-5 text-red-500" />
              </Button>
            </Modal.Open>
          </Tooltip>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary/10 via-surface to-surface px-8 py-10 shadow-sm lg:px-12 lg:py-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative max-w-4xl space-y-5">
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-semibold tracking-wider text-primary">
            {project.key}-{issue.issueNumber}
          </span>

          <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight text-primary lg:text-5xl">
            {issue.title}
          </h1>
        </div>
      </section>

      {/* Status strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Tile
          icon={<Circle className="h-3.5 w-3.5" />}
          label="Status"
          value={issue.status.replace(/_/g, ' ')}
          tone={statusTone}
        />
        <Tile
          icon={<Flag className="h-3.5 w-3.5" />}
          label="Priority"
          value={issue.priority}
          tone={priorityTone}
        />
        <Tile
          icon={<Layers className="h-3.5 w-3.5" />}
          label="Type"
          value={issue.issueType}
        />
      </div>

      {/* Body */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main */}
        <div className="min-w-0 space-y-6">
          <Card title="Description">
            {issue.description ? (
              <p className="whitespace-pre-wrap text-base leading-8 text-muted-foreground">
                {issue.description}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                No description provided.
              </p>
            )}
          </Card>
          <Card
            title="Labels"
            icon={<Tag className="h-4 w-4 text-muted-foreground" />}
            action={
              !isLabelsLoading && availableLabels.length > 0 ? (
                <Select
                  defaultValue=""
                  onChange={handleAddLabel}
                  disabled={addIssueLabel.isPending}
                  className="w-44"
                >
                  <option value="">Add label...</option>

                  {availableLabels.map((label) => (
                    <option key={label.id} value={label.id}>
                      {label.name}
                    </option>
                  ))}
                </Select>
              ) : undefined
            }
          >
            <div className="flex flex-wrap items-center gap-2">
              {issue.labels?.length ? (
                issue.labels.map((label) => (
                  <div
                    key={label.id}
                    className="flex items-center gap-2 rounded-full border py-1 pl-3 pr-1.5"
                    style={{
                      borderColor: `color-mix(in srgb, ${label.color} 35%, transparent)`,
                      backgroundColor: `color-mix(in srgb, ${label.color} 10%, transparent)`,
                    }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />

                    <span className="text-sm font-medium text-primary">
                      {label.name}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveLabel(label.id)}
                      disabled={removeIssueLabel.isPending}
                      className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition hover:bg-red-500/10 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                      title={`Remove ${label.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  No labels yet.
                </span>
              )}
            </div>
          </Card>{' '}
          <Comments
            projectId={projectId ?? ''}
            issueId={issue.id}
            currentUserId={user?.id ?? ''}
          />
        </div>
        {/* Right rail */}
        <aside className="space-y-6 lg:sticky lg:top-6">
          <Card title="People">
            <div className="space-y-6">
              <Person role="Reporter" user={issue.reporter} />

              <div className="h-px bg-border" />

              {issue.assignee ? (
                <Person role="Assignee" user={issue.assignee} />
              ) : (
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Assignee
                  </p>

                  <Modal.Open opens="assign-issue">
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background">
                        <UserPlus className="h-4 w-4" />
                      </span>
                      Unassigned. Click to assign
                    </button>
                  </Modal.Open>
                </div>
              )}
            </div>
          </Card>

          <Card title="Timeline">
            <ol className="relative space-y-6 border-l border-border pl-6">
              <li className="relative">
                <span className="absolute -left-7.25 top-1 h-3 w-3 rounded-full border-2 border-surface bg-primary" />
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="mt-0.5 text-sm font-medium text-primary">
                  {new Date(issue.createdAt).toLocaleDateString()}
                </p>
              </li>

              <li className="relative">
                <span className="absolute -left-7.25 top-1 h-3 w-3 rounded-full border-2 border-surface bg-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">Last updated</p>
                <p className="mt-0.5 text-sm font-medium text-primary">
                  {new Date(issue.updatedAt).toLocaleDateString()}
                </p>
              </li>
            </ol>
          </Card>
        </aside>
        {/* Comments */}
      </div>

      {/* Modals */}
      <Modal.Window name="assign-issue">
        {isMembersPending ? (
          <div className="p-6 text-sm text-muted-foreground">
            Loading members...
          </div>
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
    </div>
  );
}

export default Issue;
