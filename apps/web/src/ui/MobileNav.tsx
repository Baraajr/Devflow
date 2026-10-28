import { Link, NavLink, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CalendarRange,
  CircleDot,
  FolderKanban,
  LayoutDashboard,
  Users,
  Mail,
  UserRound,
} from 'lucide-react';
import { useMyMembership } from '../hooks/useOrganizations';

function MobileNav() {
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
          label: 'Issues',
          href: `/organizations/${organizationId}/projects/${projectId}/issues`,
          icon: CircleDot,
        },
        {
          label: 'Sprints',
          href: `/organizations/${organizationId}/projects/${projectId}/sprints`,
          icon: CalendarRange,
        },
        {
          label: 'Members',
          href: `/organizations/${organizationId}/projects/${projectId}/members`,
          icon: Users,
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
                  label: 'Members',
                  href: `/organizations/${organizationId}/members`,
                  icon: Users,
                },
                {
                  label: 'Invites',
                  href: `/organizations/${organizationId}/invitations`,
                  icon: Mail,
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
          {
            label: 'Account',
            href: '/account',
            icon: UserRound,
          },
        ];

  const showBack = Boolean(organizationId || projectId);

  const backHref = projectId
    ? `/organizations/${organizationId}/projects`
    : '/organizations';

  const backLabel = projectId ? 'Projects' : 'Orgs';

  const columns = navigation.length + (showBack ? 1 : 0);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <div
        className="mx-auto grid h-16 max-w-lg items-center gap-1 px-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {/* Back */}
        {showBack && (
          <Link
            to={backHref}
            aria-label={`Back to ${backLabel}`}
            className="group relative flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="flex h-7 w-12 items-center justify-center rounded-xl transition-colors group-hover:bg-muted">
              <ArrowLeft className="size-5" strokeWidth={1.8} />
            </span>
            <span>{backLabel}</span>

            <span className="absolute right-0 top-1/2 h-6 w-px -translate-y-1/2 bg-border" />
          </Link>
        )}

        {/* Navigation */}
        {navigation.map(({ label, href, icon: Icon, end }) => (
          <NavLink
            key={href}
            to={href}
            end={end}
            className={({ isActive }) =>
              [
                'group flex h-full flex-col items-center justify-center gap-1',
                'text-[11px] font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={[
                    'flex h-7 w-12 items-center justify-center rounded-xl transition-colors',
                    isActive ? 'bg-primary/10' : 'group-hover:bg-muted',
                  ].join(' ')}
                >
                  <Icon className="size-5" strokeWidth={isActive ? 2.2 : 1.8} />
                </span>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default MobileNav;
