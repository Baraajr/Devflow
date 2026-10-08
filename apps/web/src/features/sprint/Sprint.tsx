import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle,
  ListChecks,
  Pencil,
  Play,
  Target,
  Trash2,
} from 'lucide-react';

import {
  useSprint,
  useStartSprint,
  useCompleteSprint,
  useDeleteSprint,
} from '../../hooks/useSprints';
import { useUpdateIssue } from '../../hooks/useIssues';
import type { IssueStatus } from '../../types/issue';
import { Spinner } from '../../ui/Spinner';
import { Button } from '../../ui/Button';
import { Tooltip } from '../../ui/Tooltip';
import Modal from '../../ui/Modal';
import ConfirmDialog from '../../ui/ConfirmDialog';
import UpdateSprintForm from './UpdateSprintForm';
import { STATUS_STYLES } from './Sprints';
import KanbanBoard from './KanbanBoard';

const COLUMN_DEFS: { id: IssueStatus; title: string }[] = [
  { id: 'todo', title: 'Todo' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
      <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
      <p className="text-sm font-medium text-red-500">{message}</p>
    </div>
  );
}

function formatDate(date?: string | null) {
  if (!date) return 'Not set';
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function Sprint() {
  const { projectId, sprintId } = useParams();

  if (!projectId || !sprintId) {
    return <ErrorState message="Invalid project URL." />;
  }

  return <SprintContent projectId={projectId} sprintId={sprintId} />;
}

function SprintContent({
  projectId,
  sprintId,
}: {
  projectId: string;
  sprintId: string;
}) {
  const queryClient = useQueryClient();

  // Optimistic overrides: issueId -> status, cleared once the request settles
  const [pendingStatuses, setPendingStatuses] = useState<
    Record<string, IssueStatus>
  >({});

  const { data: sprint, isPending, isError } = useSprint(projectId, sprintId);
  const { mutate: startSprint, isPending: isStarting } =
    useStartSprint(projectId);
  const { mutate: completeSprint, isPending: isCompleting } =
    useCompleteSprint(projectId);
  const { mutate: deleteSprint, isPending: isDeleting } =
    useDeleteSprint(projectId);
  const updateIssue = useUpdateIssue(projectId);

  if (isError) return <ErrorState message="Failed to load sprint." />;

  if (isPending) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const status = sprint.status?.toLowerCase();
  const isPlanned = status === 'planned';
  const tone = STATUS_STYLES[sprint.status] ?? STATUS_STYLES.planned;

  const issues = (sprint.issues ?? []).map((issue) =>
    pendingStatuses[issue.id]
      ? { ...issue, status: pendingStatuses[issue.id] }
      : issue,
  );

  const columns = COLUMN_DEFS.map((column) => ({
    ...column,
    issues: issues.filter((issue) => issue.status === column.id),
  }));

  // Count only what's actually on the board so numbers always match
  const total = columns.reduce((sum, column) => sum + column.issues.length, 0);
  const doneCount = columns.find((c) => c.id === 'done')?.issues.length ?? 0;
  const progress = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const handleIssueStatusChange = async (
    issueId: string,
    newStatus: IssueStatus,
  ) => {
    const current = issues.find((issue) => issue.id === issueId);

    // Dropped in its own column (or unknown issue): nothing to do
    if (!current || current.status === newStatus) return;

    setPendingStatuses((prev) => ({ ...prev, [issueId]: newStatus }));

    try {
      await updateIssue.mutateAsync({ issueId, data: { status: newStatus } });
      await queryClient.invalidateQueries({
        queryKey: ['sprint', projectId, sprintId],
      });
    } catch {
      // The override is removed below, so the card returns to its column.
      // Show an error toast here.
    } finally {
      setPendingStatuses((prev) => {
        const { [issueId]: _removed, ...rest } = prev;
        return rest;
      });
    }
  };

  return (
    <Modal>
      <div className="space-y-8">
        {/* Header */}
        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="truncate text-2xl font-semibold tracking-tight text-primary">
                    {sprint.name}
                  </h1>

                  {sprint.status && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${tone.bg} ${tone.text}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${tone.dot} ${
                          status === 'active' ? 'animate-pulse' : ''
                        }`}
                      />
                      {sprint.status}
                    </span>
                  )}
                </div>

                {sprint.goal && (
                  <p className="mt-2 flex max-w-2xl items-start gap-2 text-sm text-muted-foreground">
                    <Target className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="line-clamp-2">{sprint.goal}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {status === 'planned' && (
                  <Button
                    onClick={() => startSprint(sprintId)}
                    disabled={isStarting}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {isStarting ? 'Starting…' : 'Start Sprint'}
                  </Button>
                )}

                {status === 'active' && (
                  <Button
                    onClick={() => completeSprint(sprintId)}
                    disabled={isCompleting}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isCompleting ? 'Completing…' : 'Complete Sprint'}
                  </Button>
                )}

                {isPlanned && (
                  <div className="flex items-center gap-0.5 rounded-xl border border-border bg-background p-1">
                    <Tooltip text="Edit sprint" position="bottom-left">
                      <Modal.Open opens="update-sprint">
                        <Button variant="ghost" type="button">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Modal.Open>
                    </Tooltip>

                    <div className="mx-1 h-5 w-px bg-border" />

                    <Tooltip text="Delete sprint" position="bottom-left">
                      <Modal.Open opens="delete-sprint">
                        <Button variant="ghost" type="button">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </Modal.Open>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">
                  Progress
                </span>
                <span className="font-medium tabular-nums text-primary">
                  {doneCount}/{total} done · {progress}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border bg-background/50 px-6 py-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="font-medium text-primary">
                {formatDate(sprint.startDate)}
              </span>
              <span aria-hidden>→</span>
              <span className="font-medium text-primary">
                {formatDate(sprint.endDate)}
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <ListChecks className="h-3.5 w-3.5" />
              <span className="font-medium tabular-nums text-primary">
                {total}
              </span>
              {total === 1 ? 'issue' : 'issues'}
            </span>
          </div>
        </section>

        {/* Board */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-primary">
              Sprint board
            </h2>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Drag cards between columns to update their status
            </p>
          </div>

          <KanbanBoard
            columns={columns}
            onIssueStatusChange={handleIssueStatusChange}
          />
        </section>
      </div>

      {/* Modals */}
      <Modal.Window name="update-sprint">
        <UpdateSprintForm
          defaultValues={{
            name: sprint.name,
            goal: sprint.goal ?? '',
            startDate: sprint.startDate ?? '',
            endDate: sprint.endDate ?? '',
          }}
          projectId={projectId}
          sprintId={sprintId}
        />
      </Modal.Window>

      <Modal.Window name="delete-sprint">
        <ConfirmDialog
          title="Delete Sprint?"
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={() => deleteSprint(sprintId)}
          disabled={isDeleting}
        />
      </Modal.Window>
    </Modal>
  );
}

export default Sprint;
