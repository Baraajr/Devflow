import {
  ArrowLeft,
  Building2,
  CalendarRange,
  CircleDot,
  FolderKanban,
  LayoutDashboard,
  Mail,
  Tags,
  Users,
} from 'lucide-react';
import { NavLink, useParams } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { useMyMembership } from '../hooks/useOrganizations';

function Sidebar() {
  const { user } = useAuth();
  const { organizationId, projectId } = useParams();
  const { data: orgMember } = useMyMembership(organizationId);

  const canView = orgMember?.role === 'owner' || orgMember?.role === 'manager';

  const navigation = projectId
    ? [
        {
          label: 'Overview',
          href: `/organizations/${organizationId}/projects/${projectId}`,
          icon: LayoutDashboard,
          end: true,
        },
        {
          label: 'Sprints',
          href: `/organizations/${organizationId}/projects/${projectId}/sprints`,
          icon: CalendarRange,
        },
        {
          label: 'Issues',
          href: `/organizations/${organizationId}/projects/${projectId}/issues`,
          icon: CircleDot,
        },
        {
          label: 'Members',
          href: `/organizations/${organizationId}/projects/${projectId}/members`,
          icon: Users,
        },
        {
          label: 'Labels',
          href: `/organizations/${organizationId}/projects/${projectId}/labels`,
          icon: Tags,
        },
      ]
    : organizationId
      ? [
          {
            label: 'Overview',
            href: `/organizations/${organizationId}`,
            icon: LayoutDashboard,
            end: true,
          },
          {
            label: 'Projects',
            href: `/organizations/${organizationId}/projects`,
            icon: FolderKanban,
          },
          ...(canView
            ? [
                {
                  label: 'Invitations',
                  href: `/organizations/${organizationId}/invitations`,
                  icon: Mail,
                },
                {
                  label: 'Members',
                  href: `/organizations/${organizationId}/members`,
                  icon: Users,
                },
              ]
            : []),
        ]
      : [
          {
            label: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
          },
          {
            label: 'Organizations',
            href: '/organizations',
            icon: Building2,
          },
        ];

  const backHref = projectId
    ? `/organizations/${organizationId}/projects`
    : '/organizations';

  const backLabel = projectId ? 'Projects' : 'Organizations';

  const sectionLabel = projectId
    ? 'Project'
    : organizationId
      ? 'Organization'
      : 'Menu';

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-surface md:block">
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt="Profile"
            className="size-9 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold uppercase text-primary">
            {user?.firstName?.[0] ?? 'W'}
          </span>
        )}

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Workspace
          </p>
          <h1 className="truncate text-sm font-semibold text-primary">
            {user?.firstName}'s Workspace
          </h1>
        </div>
      </div>

      <div className="sticky top-0 flex h-[calc(100vh-4rem)] flex-col px-4 py-5">
        {(organizationId || projectId) && (
          <NavLink
            to={backHref}
            className="group mb-6 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary hover:shadow-md"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            <span>{backLabel}</span>
          </NavLink>
        )}

        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {sectionLabel}
        </p>

        <nav className="space-y-1">
          {navigation.map(({ label, href, icon: Icon, end }) => (
            <NavLink
              key={href}
              to={href}
              end={end}
              className={({ isActive }) =>
                [
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={[
                      'size-4 shrink-0 transition-colors',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-foreground',
                    ].join(' ')}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-border pt-4">
          <p className="px-3 text-xs font-medium text-muted-foreground">
            DevFlow
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
