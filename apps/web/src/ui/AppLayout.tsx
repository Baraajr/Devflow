import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

function AppLayout() {
  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Header isAuthenticated={true} />

        <main className="min-w-0 pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}

export default AppLayout;
