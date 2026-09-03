import { NavLink } from 'react-router-dom';
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

const navigation = [
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
    label: 'Projects',
    href: '/projects',
    icon: FolderKanban,
  },
  {
    label: 'Issues',
    href: '/issues',
    icon: CircleDot,
  },
  {
    label: 'Tasks',
    href: '/tasks',
    icon: ListTodo,
  },
  {
    label: 'Members',
    href: '/members',
    icon: Users,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-background md:block">
      <div className="border-b p-4">
        <h1 className="text-sm font-semibold">{user?.firstName}'s Workspace</h1>
      </div>
      <div className="sticky top-0 flex h-full flex-col p-4">
        <nav className="space-y-1">
          {navigation.map(({ label, href, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
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
