import { ArrowUpRight, Building2, Plus, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { useOrganizations } from '../../hooks/useOrganizations';
import EmptyState from './EmptyState';
import CreateOrganizationForm from './CreateOrganizationForm';
import Modal from '../../ui/Modal';
import { Button } from '../../ui/Button';

function Organizations() {
  const { data: organizations, isPending, isError, error } = useOrganizations();

  const count = organizations?.length ?? 0;

  return (
    <div className="space-y-6  p-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary/10 via-surface to-surface px-8 py-8 shadow-sm">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Building2 className="h-7 w-7" />
            </span>

            <div className="min-w-0">
              <h1 className="truncate text-3xl font-semibold tracking-tight text-primary">
                Organizations
              </h1>

              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
                Manage your organizations and teams.
              </p>
            </div>
          </div>

          <Modal.Open opens="create-organization">
            <Button type="button">
              <Plus className="mr-1.5 h-4 w-4" />
              Create organization
            </Button>
          </Modal.Open>
        </div>
      </section>

      {/* Your organizations */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-primary">
            Your organizations
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isPending
              ? 'Loading your organizations...'
              : `You belong to ${count} ${count === 1 ? 'organization' : 'organizations'}.`}
          </p>
        </div>

        {/* Loading */}
        {isPending && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-2xl bg-surface"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!isPending && isError && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <p className="text-sm font-medium text-red-500">
              Failed to load organizations
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Something went wrong.'}
            </p>
          </div>
        )}

        {/* Empty */}
        {!isPending && !isError && count === 0 && <EmptyState />}

        {/* Grid */}
        {!isPending && !isError && count > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {organizations?.map((org) => (
              <NavLink
                key={org.id}
                to={`/organizations/${org.id}`}
                className="group flex min-h-48 flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {org.role}
                  </p>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:scale-110">
                    <Building2 className="h-4 w-4" />
                  </span>
                </div>

                <h3 className="mt-3 truncate text-xl font-semibold tracking-tight text-primary">
                  {org.name}
                </h3>

                <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {org.description || 'No description provided.'}
                </p>

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>
                      {org.memberCount}{' '}
                      {org.memberCount === 1 ? 'member' : 'members'}
                    </span>
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </NavLink>
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <Modal.Window name="create-organization">
        <CreateOrganizationForm />
      </Modal.Window>
    </div>
  );
}

export default Organizations;
