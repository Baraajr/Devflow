import { Link } from 'react-router-dom';
import { Button } from './Button';
import Logo from './Logo';
import { Bell, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import NotificationCenter from '../features/notifications/NotificationCenter';
import { useLogout } from '../hooks/useAuth';

function Header() {
  const [showNotification, setShowNotification] = useState(false);
  const { logout, isLoggingOut } = useLogout();

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <header className="relative border-b bg-surface">
      <div className="mx-auto flex h-16  items-center justify-between">
        <Logo />

        <div className="flex items-center gap-2 px-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotification((show) => !show)}
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg
        text-muted-foreground transition-colors
        hover:bg-muted hover:text-foreground"
            >
              <Bell size={18} strokeWidth={1.8} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />
            </button>

            {showNotification && (
              <NotificationCenter onClose={() => setShowNotification(false)} />
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setIsDark((prev) => !prev)}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg
      text-muted-foreground transition-colors
      hover:bg-muted hover:text-foreground"
          >
            {isDark ? (
              <Sun size={18} strokeWidth={1.8} />
            ) : (
              <Moon size={18} strokeWidth={1.8} />
            )}
          </button>

          <div className="mx-1 h-6 w-px bg-border" />

          {/* Account */}
          <Link
            to="/account"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium
      text-muted-foreground transition-colors
      hover:bg-muted hover:text-foreground md:block"
          >
            Account
          </Link>

          {/* Logout */}
          <Button
            variant="danger-ghost"
            onClick={() => logout()}
            loading={isLoggingOut}
            className="hidden"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
