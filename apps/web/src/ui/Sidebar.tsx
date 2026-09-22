import { NavLink, useLocation } from 'react-router-dom';
import {
  FolderKanban,
  LayoutDashboard,
  Settings,
  CircleDot,
  ListTodo,
  Users,
  Building2,
  Mail,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const organizationId = location.pathname.match(
    /^\/organizations\/([^/]+)/,
  )?.[1];

  const navigation = organizationId
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
        {
          label: 'Issues',
          href: `/organizations/${organizationId}/issues`,
          icon: CircleDot,
        },
        {
          label: 'Tasks',
          href: `/organizations/${organizationId}/tasks`,
          icon: ListTodo,
        },
        {
          label: 'Members',
          href: `/organizations/${organizationId}/members`,
          icon: Users,
        },
        {
          label: 'Invitations',
          href: `/organizations/${organizationId}/invitations`,
          icon: Mail,
        },
        {
          label: 'Settings',
          href: `/organizations/${organizationId}/settings`,
          icon: Settings,
        },
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

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-surface md:block">
      {/* Workspace header */}
      <div className="flex h-16 items-center border-b px-5">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Workspace</p>
          <h1 className="truncate text-sm font-semibold">
            {user?.firstName}'s Workspace
          </h1>
        </div>
      </div>

      <div className="sticky top-0 flex h-[calc(100vh-4rem)] flex-col px-3 py-4">
        {/* Back navigation */}
        {organizationId && (
          <NavLink
            to="/organizations"
            className="mb-5 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span>Organizations</span>
          </NavLink>
        )}

        {/* Navigation */}
        <nav className="space-y-1">
          {navigation.map(({ label, href, icon: Icon, end }) => (
            <NavLink
              key={href}
              to={href}
              end={end}
              className={({ isActive }) =>
                [
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
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

        {/* Bottom area */}
        <div className="mt-auto border-t pt-4">
          <p className="px-3 text-xs text-muted-foreground">DevFlow</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
