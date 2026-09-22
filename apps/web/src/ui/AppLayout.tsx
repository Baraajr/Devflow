import { Outlet } from 'react-router-dom';

import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
