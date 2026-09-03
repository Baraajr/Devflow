import { Link } from 'react-router-dom';
import { Button } from './Button';
import { useLogout } from '../hooks/useLogout';
import Logo from './Logo';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const navItems = [
  { label: 'Projects', href: '/projects' },
  { label: 'Issues', href: '/issues' },
  { label: 'About', href: '/about' },
];

function Header() {
  const { logout, isLoggingout } = useLogout();

  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setIsDark((prev) => !prev)}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          <Link
            to="/account"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Account
          </Link>

          <Button
            variant="danger-ghost"
            onClick={() => logout()}
            loading={isLoggingout}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
