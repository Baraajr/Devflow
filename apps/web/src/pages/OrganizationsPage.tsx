import EmptyState from '../features/organization/EmptyState';
import Organizations from '../features/organization/Organizations';
import TopBar from '../features/organization/TopBar';
import { useOrganizations } from '../hooks/useOrganizations';
import Modal from '../ui/Modal';
import OrganizationsSkeleton from '../ui/OrganizationsSkeleton';

function OrganizationsPage() {
  const { data: organizations, isPending, isError } = useOrganizations();

  if (isPending) {
    return <OrganizationsSkeleton />;
  }

  if (isError) {
    return <div>Failed to load organizations.</div>;
  }

  return (
    <Modal>
      <div className="min-h-full">
        <TopBar />

        {organizations?.length === 0 ? (
          <EmptyState />
        ) : (
          <Organizations organizations={organizations ?? []} />
        )}
      </div>
    </Modal>
  );
}

export default OrganizationsPage;
