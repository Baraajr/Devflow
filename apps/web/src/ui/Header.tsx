import { Link } from 'react-router-dom';
import { Button } from './Button';
import { useLogout } from '../hooks/useLogout';
import Logo from './Logo';

const navItems = [
  { label: 'Projects', href: '/projects' },
  { label: 'Issues', href: '/issues' },
  { label: 'About', href: '/about' },
];

function Header() {
  const { logout, isLoggingout } = useLogout();

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
