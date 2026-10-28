import { Outlet } from 'react-router-dom';
import Header from './Header';

function LandingLayout() {
  return (
    <>
      <Header isAuthenticated={false} />
      <Outlet />
    </>
  );
}

export default LandingLayout;
