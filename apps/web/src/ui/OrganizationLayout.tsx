import { Navigate, Outlet, useParams } from 'react-router-dom';

import { useOrganization } from '../hooks/useOrganizations';
import { Spinner } from './Spinner';

function OrganizationLayout() {
  const { organizationId } = useParams<{
    organizationId: string;
  }>();

  const {
    data: organization,
    isPending,
    isError,
  } = useOrganization(organizationId);

  if (!organizationId) {
    return <Navigate to="/organizations" replace />;
  }

  if (isPending) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !organization) {
    return <Navigate to="/organizations" replace />;
  }

  return (
    <div className="min-h-full">
      <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
        <Outlet context={{ organization }} />
      </main>
    </div>
  );
}

export default OrganizationLayout;
