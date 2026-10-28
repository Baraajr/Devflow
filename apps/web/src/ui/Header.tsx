import { Link } from 'react-router-dom';
import { Button } from './Button';
import Logo from './Logo';
import { Bell, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import NotificationCenter from '../features/notifications/NotificationCenter';
import { useLogout } from '../hooks/useAuth';

type HeaderProps = {
  isAuthenticated: boolean;
};

function Header({ isAuthenticated }: HeaderProps) {
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
      <div className="mx-auto flex h-16 items-center justify-between">
        <Logo />

        <div className="flex items-center gap-2 px-4">
          {isAuthenticated && (
            <>
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotification((show) => !show)}
                  aria-label="Notifications"
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg
            text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Bell size={18} strokeWidth={1.8} />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />
                </button>

                {showNotification && (
                  <NotificationCenter
                    onClose={() => setShowNotification(false)}
                  />
                )}
              </div>
            </>
          )}

          {/* Theme toggle: available to everyone */}
          <button
            onClick={() => setIsDark((prev) => !prev)}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg
      text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              <div className="mx-1 h-6 w-px bg-border" />

              <Link
                to="/account"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium
          text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:block"
              >
                Account
              </Link>

              <Button
                variant="danger-ghost"
                onClick={() => logout()}
                loading={isLoggingOut}
              >
                Logout
              </Button>
            </>
          ) : (
            <nav className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-md px-4 py-2.5 text-sm font-medium
          text-muted-foreground transition-colors hover:text-foreground"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="rounded-md bg-primary px-3 py-2.5 text-sm font-medium
          text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get started
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
