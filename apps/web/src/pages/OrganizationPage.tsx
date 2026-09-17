import { useParams } from 'react-router-dom';
import { useOrganization } from '../hooks/useOrganization';
import { useOrganizationMembers } from '../hooks/useOrganizationMembers';
import { Spinner } from '../ui/Spinner';
import Modal from '../ui/Modal';

export default function OrganizationPage() {
  const { organizationId } = useParams();

  const {
    data: organization,
    isPending: isLoadingOrg,
    isError: orgError,
  } = useOrganization(organizationId);

  const {
    data: members,
    isPending: isLoadingMembers,
    isError: membersError,
  } = useOrganizationMembers(organizationId);

  if (isLoadingOrg || isLoadingMembers) {
    return <Spinner />;
  }

  if (orgError) {
    return <div>Failed to load organization.</div>;
  }

  if (membersError) {
    return <div>Failed to load members.</div>;
  }

  return (
    <Modal>
      <div>
        <div className="mb-6 flex justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Organization</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {organization?.name}
            </h1>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Projects" value="0" />
          <StatCard title="Issues" value="0" />

          <StatCard
            title="Members"
            value={isLoadingMembers ? '...' : String(members?.length ?? 0)}
          />
          <StatCard title="Sprints" value="0" />
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Organization ID: {organizationId}
        </p>
      </div>{' '}
    </Modal>
  );
}
function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
