import { useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Bug,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Plus,
  UserRound,
} from 'lucide-react';
import { NavLink, useParams } from 'react-router-dom';

import { useProjectIssues } from '../../hooks/useIssues.ts';
import type { IssueSort } from '../../types/issue.ts';
import Modal from '../../ui/Modal.tsx';
import { Button } from '../../ui/Button.tsx';
import { SortSelect, type SortSelectOption } from '../../ui/SortSelect.tsx';
import CreateIssueForm from './CreateIssueForm.tsx';

/* ---------- Style helpers ---------- */

type Tone = {
  dot: string;
  text: string;
  bg: string;
  ring: string;
  bar: string;
};

const NEUTRAL: Tone = {
  dot: 'bg-muted-foreground',
  text: 'text-muted-foreground',
  bg: 'bg-muted',
  ring: 'ring-border',
  bar: 'bg-muted-foreground/30',
};

const INFO: Tone = {
  dot: 'bg-info',
  text: 'text-info',
  bg: 'bg-info/10',
  ring: 'ring-info/20',
  bar: 'bg-info',
};

const DANGER: Tone = {
  dot: 'bg-danger',
  text: 'text-danger',
  bg: 'bg-danger/10',
  ring: 'ring-danger/20',
  bar: 'bg-danger',
};

const STATUS_TONES: Record<string, Tone> = {
  todo: NEUTRAL,
  in_progress: INFO,
  in_review: {
    dot: 'bg-primary',
    text: 'text-primary',
    bg: 'bg-primary/10',
    ring: 'ring-primary/20',
    bar: 'bg-primary',
  },
  done: {
    dot: 'bg-success',
    text: 'text-success',
    bg: 'bg-success/10',
    ring: 'ring-success/20',
    bar: 'bg-success',
  },
};

const PRIORITY_TONES: Record<string, Tone> = {
  low: NEUTRAL,
  medium: INFO,
  high: {
    dot: 'bg-warning',
    text: 'text-warning',
    bg: 'bg-warning/10',
    ring: 'ring-warning/20',
    bar: 'bg-warning',
  },
  critical: DANGER,
  urgent: DANGER,
};

function Badge({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${tone.bg} ${tone.text} ${tone.ring}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {label}
    </span>
  );
}

const ISSUES_PAGE_SIZE = 10;

const SORT_OPTIONS: SortSelectOption[] = [
  { value: 'issueNumber:desc', group: 'Issue number', label: 'Highest first' },
  { value: 'issueNumber:asc', group: 'Issue number', label: 'Lowest first' },
  { value: 'createdAt:desc', group: 'Created date', label: 'Newest first' },
  { value: 'createdAt:asc', group: 'Created date', label: 'Oldest first' },
  { value: 'updatedAt:desc', group: 'Updated date', label: 'Recently updated' },
  {
    value: 'updatedAt:asc',
    group: 'Updated date',
    label: 'Least recently updated',
  },
  { value: 'title:asc', group: 'Title', label: 'A → Z' },
  { value: 'title:desc', group: 'Title', label: 'Z → A' },
  { value: 'priority:desc', group: 'Priority', label: 'High → Low' },
  { value: 'priority:asc', group: 'Priority', label: 'Low → High' },
];

/* ---------- Page ---------- */

function Issues() {
  const { projectId } = useParams<{ projectId: string }>();

  const [sort, setSort] = useState<IssueSort>('issueNumber');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useProjectIssues(
    projectId ?? '',
    page,
    ISSUES_PAGE_SIZE,
    sort,
    order,
  );

  const issues = data?.data ?? [];

  if (!projectId) {
    return <p className="text-sm text-muted-foreground">Project not found.</p>;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-3xl bg-surface" />

        <div className="flex items-center justify-between">
          <div className="h-4 w-40 animate-pulse rounded bg-surface" />
          <div className="h-11 w-56 animate-pulse rounded-xl bg-surface" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex h-44 animate-pulse flex-col justify-between rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted" />
                  <div className="space-y-2">
                    <div className="h-2.5 w-10 rounded bg-muted" />
                    <div className="h-2.5 w-14 rounded bg-muted" />
                  </div>
                </div>
                <div className="h-6 w-20 rounded-full bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-4/5 rounded bg-muted" />
                <div className="h-4 w-2/5 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-danger/20 bg-danger/5 px-6 py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertCircle className="h-5 w-5" />
        </span>

        <p className="mt-4 text-sm font-semibold text-danger">
          Failed to load issues
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Something went wrong while fetching this project's issues.
        </p>

        <Button variant="ghost" className="mt-5" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const total = data?.pagination.total ?? 0;
  const rangeStart = total === 0 ? 0 : (page - 1) * ISSUES_PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * ISSUES_PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary/10 via-surface to-surface px-6 py-7 shadow-sm sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-info/10 blur-3xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 sm:flex">
              <CircleDot className="h-6 w-6" />
            </span>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight text-primary">
                  Issues
                </h1>

                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
                  {total}
                </span>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage and track issues for this project.
              </p>
            </div>
          </div>

          <Modal.Open opens="create-issue">
            <Button>
              <Plus size={18} />
              Create issue
            </Button>
          </Modal.Open>
        </div>
      </section>

      <Modal.Window name="create-issue">
        <CreateIssueForm projectId={projectId} />
      </Modal.Window>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Showing{' '}
          <span className="font-semibold text-foreground">
            {rangeStart}–{rangeEnd}
          </span>{' '}
          of <span className="font-semibold text-foreground">{total}</span>{' '}
          issues
        </p>

        <SortSelect
          value={`${sort}:${order}`}
          options={SORT_OPTIONS}
          onChange={(v) => {
            const [sortBy, sortOrder] = v.split(':');

            setSort(sortBy as IssueSort);
            setOrder(sortOrder as 'asc' | 'desc');
            setPage(1);
          }}
        />
      </div>

      {/* List */}
      {issues.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary ring-8 ring-primary/5">
            <CircleDot className="h-6 w-6" />
          </span>

          <p className="mt-5 text-base font-semibold text-primary">
            No issues found
          </p>

          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Create an issue to start tracking work for this project.
          </p>

          <Modal.Open opens="create-issue">
            <Button className="mt-6">
              <Plus size={18} />
              Create issue
            </Button>
          </Modal.Open>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {issues.map((issue) => {
            const isBug = issue.issueType === 'bug';
            const priorityTone = PRIORITY_TONES[issue.priority] ?? NEUTRAL;

            return (
              <NavLink
                key={issue.id}
                to={`${issue.id}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm outline-none transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.99]"
              >
                {/* Priority accent */}
                <span
                  className={`absolute inset-y-0 left-0 w-1 ${priorityTone.bar}`}
                />

                <div className="flex-1 space-y-4 p-5 pl-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${
                          isBug
                            ? 'bg-danger/10 ring-danger/20'
                            : 'bg-primary/10 ring-primary/20'
                        }`}
                      >
                        {isBug ? (
                          <Bug className="h-4 w-4 text-danger" />
                        ) : (
                          <CircleDot className="h-4 w-4 text-primary" />
                        )}
                      </span>

                      <div className="min-w-0">
                        <p className="font-mono text-xs font-medium text-muted-foreground">
                          #{issue.issueNumber}
                        </p>

                        <p className="text-xs capitalize text-muted-foreground/80">
                          {issue.issueType}
                        </p>
                      </div>
                    </div>

                    <Badge
                      label={issue.status.replace(/_/g, ' ')}
                      tone={STATUS_TONES[issue.status] ?? NEUTRAL}
                    />
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-primary transition group-hover:text-primary/80">
                      {issue.title}
                    </h3>

                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 -translate-x-1 translate-y-1 text-primary opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-5 py-3 pl-6">
                  <Badge label={issue.priority} tone={priorityTone} />

                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${
                        issue.assigneeId
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground/60'
                      }`}
                    >
                      <UserRound className="h-3.5 w-3.5" />
                    </span>

                    <span
                      className={
                        issue.assigneeId
                          ? 'font-medium text-foreground'
                          : 'text-muted-foreground'
                      }
                    >
                      {issue.assigneeId ? 'Assigned' : 'Unassigned'}
                    </span>
                  </div>
                </div>
              </NavLink>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.numberOfPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm">
          <Button
            variant="ghost"
            disabled={!data.pagination.prev}
            onClick={() => setPage((page) => page - 1)}
          >
            <ChevronLeft size={16} />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page{' '}
            <span className="font-semibold text-foreground">
              {data.pagination.currentPage}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-foreground">
              {data.pagination.numberOfPages}
            </span>
          </span>

          <Button
            variant="ghost"
            disabled={!data.pagination.next}
            onClick={() => setPage((page) => page + 1)}
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}

export default Issues;
