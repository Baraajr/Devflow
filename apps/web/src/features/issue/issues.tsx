import { NavLink, useParams } from 'react-router-dom';

import { useState } from 'react';

import { useProjectIssues } from '../../hooks/useIssues.ts';
import Modal from '../../ui/Modal.tsx';
import CreateIssueForm from './CreateIssueForm.tsx';
import { Button } from '../../ui/Button.tsx';
import { Bug, ChevronRight, CircleDot, Plus, Search } from 'lucide-react';

/* ---------- Style helpers ---------- */

type Tone = { dot: string; pill: string };

const NEUTRAL: Tone = {
  dot: 'bg-muted-foreground',
  pill: 'bg-muted text-muted-foreground ring-border',
};

const STATUS_TONES: Record<string, Tone> = {
  todo: NEUTRAL,
  in_progress: {
    dot: 'bg-info',
    pill: 'bg-info/10 text-info ring-info/20',
  },
  in_review: {
    dot: 'bg-primary',
    pill: 'bg-primary/10 text-primary ring-primary/20',
  },
  done: {
    dot: 'bg-success',
    pill: 'bg-success/10 text-success ring-success/20',
  },
};

const PRIORITY_TONES: Record<string, Tone> = {
  low: NEUTRAL,
  medium: {
    dot: 'bg-info',
    pill: 'bg-info/10 text-info ring-info/20',
  },
  high: {
    dot: 'bg-warning',
    pill: 'bg-warning/10 text-warning ring-warning/20',
  },
  critical: {
    dot: 'bg-danger',
    pill: 'bg-danger/10 text-danger ring-danger/20',
  },
  urgent: {
    dot: 'bg-danger',
    pill: 'bg-danger/10 text-danger ring-danger/20',
  },
};

function Badge({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${tone.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {label}
    </span>
  );
}

/* ---------- Page ---------- */

function Issues() {
  const { projectId } = useParams<{ projectId: string }>();
  const [search, setSearch] = useState('');

  const {
    data: issues = [],
    isLoading,
    isError,
  } = useProjectIssues(projectId ?? '');

  if (!projectId) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Project not found.
      </div>
    );
  }

  const filteredIssues = issues.filter((issue) =>
    `${issue.issueNumber} ${issue.title}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const isSearching = search.trim().length > 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-lg border border-border bg-linear-to-br from-primary/10 via-surface to-surface px-6 py-8 shadow-sm lg:px-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Issues
              </h1>

              {!isLoading && !isError && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {issues.length}
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              Manage and track issues for this project.
            </p>
          </div>

          <Modal.Open opens="create-issue">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create issue
            </Button>
          </Modal.Open>

          <Modal.Window name="create-issue">
            <CreateIssueForm projectId={projectId} />
          </Modal.Window>
        </div>
      </section>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by number or title..."
          className="h-11 w-full rounded-lg border border-border bg-surface pl-10 pr-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 p-4">
              <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />

              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/5 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-lg border border-danger/20 bg-danger/5 p-8 text-center text-sm font-medium text-danger">
          Failed to load issues.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && filteredIssues.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-surface p-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CircleDot className="h-6 w-6 text-primary" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-foreground">
            {isSearching ? 'No matching issues' : 'No issues found'}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {isSearching
              ? 'Try a different number or title.'
              : 'Create an issue to start tracking work in this project.'}
          </p>
        </div>
      )}

      {/* List */}
      {!isLoading && !isError && filteredIssues.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
          {/* Column header */}
          <div className="hidden items-center gap-4 border-b border-border bg-muted/50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:flex">
            <span className="flex-1 pl-13">Issue</span>
            <span className="w-28">Status</span>
            <span className="w-24">Priority</span>
            <span className="w-24">Assignee</span>
            <span className="w-4" />
          </div>

          <div className="divide-y divide-border">
            {filteredIssues.map((issue) => {
              const isBug = issue.issueType === 'bug';

              return (
                <NavLink
                  key={issue.id}
                  to={`${issue.id}`}
                  className="group block px-5 py-4 transition hover:bg-surface-hover"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                        isBug ? 'bg-danger/10' : 'bg-primary/10'
                      }`}
                    >
                      {isBug ? (
                        <Bug className="h-4 w-4 text-danger" />
                      ) : (
                        <CircleDot className="h-4 w-4 text-primary" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-foreground transition group-hover:text-primary">
                        {issue.title}
                      </h3>

                      <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">#{issue.issueNumber}</span>
                        <span>·</span>
                        <span className="capitalize">{issue.issueType}</span>
                      </p>
                    </div>

                    <div className="hidden w-28 md:block">
                      <Badge
                        label={issue.status.replace(/_/g, ' ')}
                        tone={STATUS_TONES[issue.status] ?? NEUTRAL}
                      />
                    </div>

                    <div className="hidden w-24 md:block">
                      <Badge
                        label={issue.priority}
                        tone={PRIORITY_TONES[issue.priority] ?? NEUTRAL}
                      />
                    </div>

                    <div className="hidden w-24 items-center gap-2 text-sm md:flex">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          issue.assigneeId
                            ? 'bg-success'
                            : 'bg-muted-foreground/40'
                        }`}
                      />

                      <span
                        className={
                          issue.assigneeId
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }
                      >
                        {issue.assigneeId ? 'Assigned' : 'Unassigned'}
                      </span>
                    </div>

                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>

                  {/* Mobile meta row */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 pl-13 md:hidden">
                    <Badge
                      label={issue.status.replace(/_/g, ' ')}
                      tone={STATUS_TONES[issue.status] ?? NEUTRAL}
                    />
                    <Badge
                      label={issue.priority}
                      tone={PRIORITY_TONES[issue.priority] ?? NEUTRAL}
                    />
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Issues;
