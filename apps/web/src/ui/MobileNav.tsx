import { NavLink } from 'react-router-dom';
import { FolderKanban, LayoutDashboard, Settings } from 'lucide-react';

const navigation = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: FolderKanban,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export default function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background md:hidden">
      <div className="grid grid-cols-3">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center gap-1 px-3 py-2 text-xs',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                ].join(' ')
              }
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
