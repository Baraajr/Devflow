import { Outlet, useParams } from 'react-router-dom';

function OrganizationLayout() {
  const { organizationId } = useParams();

  if (!organizationId) {
    return null;
  }

  return (
    <div className="min-h-full">
      <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
export default OrganizationLayout;
