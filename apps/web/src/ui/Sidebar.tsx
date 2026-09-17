import { NavLink, useLocation } from 'react-router-dom';
import {
  FolderKanban,
  LayoutDashboard,
  Settings,
  CircleDot,
  ListTodo,
  Users,
  Building2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar() {
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
        {
          label: 'Settings',
          href: '/settings',
          icon: Settings,
        },
      ];

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-background md:block">
      <div className="border-b p-4">
        <h1 className="text-sm font-semibold">{user?.firstName}'s Workspace</h1>
      </div>

      <div className="sticky top-0 flex h-[calc(100vh-65px)] flex-col p-4">
        <nav className="space-y-1">
          {navigation.map(({ label, href, icon: Icon, end }) => (
            <NavLink
              key={href}
              to={href}
              end={end}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-surface-hover text-foreground'
                    : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
                ].join(' ')
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
