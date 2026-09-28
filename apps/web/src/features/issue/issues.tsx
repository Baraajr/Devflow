import { NavLink, useParams } from 'react-router-dom';

import { useState } from 'react';

import { useProjectIssues } from '../../hooks/useIssues.ts';
import Modal from '../../ui/Modal.tsx';
import CreateIssueForm from './CreateIssueForm.tsx';
import { Button } from '../../ui/Button.tsx';
import { Bug, CircleDot, Plus, Search, UserRound } from 'lucide-react';

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

  return (
    <Modal>
      <div className="space-y-6 mx-auto max-w-7xl p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Issues</h1>

            <p className="mt-1 text-sm text-muted-foreground">
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

        <div className="flex items-center gap-3">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search issues..."
              className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {isLoading && (
          <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
            Loading issues...
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-red-500">
            Failed to load issues.
          </div>
        )}

        {!isLoading && !isError && filteredIssues.length === 0 && (
          <div className="rounded-lg border border-border bg-surface p-12 text-center">
            <CircleDot className="mx-auto h-10 w-10 text-muted-foreground" />

            <h2 className="mt-4 text-lg font-medium text-primary">
              No issues found
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Create an issue to start tracking work in this project.
            </p>
          </div>
        )}

        {!isLoading && !isError && filteredIssues.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <div className="divide-y divide-border">
              {filteredIssues.map((issue) => (
                <NavLink
                  key={issue.id}
                  to={`${issue.id}`}
                  className="block p-4 transition hover:bg-primary/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      {issue.issueType === 'bug' ? (
                        <Bug className="h-4 w-4 text-primary" />
                      ) : (
                        <CircleDot className="h-4 w-4 text-primary" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          #{issue.issueNumber}
                        </span>

                        <h3 className="truncate text-sm font-medium text-primary">
                          {issue.title}
                        </h3>
                      </div>

                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="capitalize">{issue.issueType}</span>

                        <span className="capitalize">
                          {issue.status.replace('_', ' ')}
                        </span>

                        <span className="capitalize">{issue.priority}</span>
                      </div>
                    </div>

                    <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
                      <UserRound className="h-4 w-4" />

                      {issue.assigneeId ? 'Assigned' : 'Unassigned'}
                    </div>
                  </div>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>{' '}
    </Modal>
  );
}

export default Issues;
