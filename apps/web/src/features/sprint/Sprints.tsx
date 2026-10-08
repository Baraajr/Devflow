import { CalendarDays, Timer, Plus } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { useProjectSprints } from '../../hooks/useSprints';

import { Button } from '../../ui/Button';
import Modal from '../../ui/Modal';

import CreateSprintForm from './CreateSprintForm';

import type { Sprint } from '../../types/sprints';

/* ---------- Style helpers ---------- */

export const STATUS_STYLES: Record<
  Sprint['status'],
  { dot: string; text: string; bg: string }
> = {
  planned: { dot: 'bg-warning', text: 'text-warning', bg: 'bg-warning/10' },
  active: { dot: 'bg-success', text: 'text-success', bg: 'bg-success/10' },
  completed: { dot: 'bg-info', text: 'text-info', bg: 'bg-info/10' },
};

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

interface SprintCardProps {
  sprint: Sprint;
  projectId: string;
}

function Sprints() {
  const { projectId } = useParams<{ projectId: string }>();

  const {
    data: sprints,
    isLoading,
    isError,
  } = useProjectSprints(projectId ?? '');

  if (!projectId) {
    return <p className="text-sm text-muted-foreground">Project not found.</p>;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-24 animate-pulse rounded-3xl bg-surface" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl bg-surface"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
        <p className="text-sm font-medium text-red-500">
          Failed to load sprints.
        </p>
      </div>
    );
  }

  return (
    <Modal>
      <div className="space-y-6">
        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary/10 via-surface to-surface px-8 py-8 shadow-sm">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-primary">
                Sprints
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Plan and manage your project sprints.
              </p>
            </div>

            <Modal.Open opens="create-sprint">
              <Button>
                <Plus size={18} />
                Create Sprint
              </Button>
            </Modal.Open>
          </div>
        </section>

        <Modal.Window name="create-sprint">
          <CreateSprintForm projectId={projectId} />
        </Modal.Window>

        {/* List */}
        {!sprints?.length ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Timer className="h-5 w-5" />
            </span>

            <h2 className="mt-4 font-semibold text-primary">No sprints yet</h2>

            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Create your first sprint to start planning work.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sprints.map((sprint) => (
              <SprintCard
                key={sprint.id}
                sprint={sprint}
                projectId={projectId}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default Sprints;

/* ---------- Card ---------- */

function SprintCard({ sprint }: SprintCardProps) {
  const tone = STATUS_STYLES[sprint.status];
  const start = formatDate(sprint.startDate);
  const end = formatDate(sprint.endDate);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition hover:border-primary/30 hover:shadow-md">
      <Link to={`${sprint.id}`} className="flex-1 space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 truncate text-lg font-semibold text-primary">
            {sprint.name}
          </h3>

          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${tone.bg} ${tone.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
            {sprint.status}
          </span>
        </div>

        {sprint.goal ? (
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {sprint.goal}
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground">No goal set.</p>
        )}

        {(start || end) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays size={14} className="shrink-0" />
            <span>
              {start ?? 'No start date'} → {end ?? 'No end date'}
            </span>
          </div>
        )}
      </Link>
    </article>
  );
}
