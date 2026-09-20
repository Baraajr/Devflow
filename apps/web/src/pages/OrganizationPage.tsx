import { useNavigate, useParams } from 'react-router-dom';
import { useOrganization } from '../hooks/useOrganization';
import { useOrganizationMembers } from '../hooks/useOrganizationMembers';
import { Spinner } from '../ui/Spinner';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from '../hooks/useAuth';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteOrganization } from '../services/organization.service';
import { ORGANIZATIONS_QUERY_KEY } from '../hooks/useOrganizations';
import { toast } from 'sonner';
import UpdateOrganizationForm from '../features/organization/updateOrganizatiopnForm';

export default function OrganizationPage() {
  const { organizationId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();

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

  const queryClient = useQueryClient();

  const { mutate: deleteOrg, isPending: isDeletingOrg } = useMutation({
    mutationFn: deleteOrganization,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ORGANIZATIONS_QUERY_KEY,
      });

      navigate('/organizations');

      toast.success('Organization deleted successfully');
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoadingOrg || isLoadingMembers) {
    return <Spinner />;
  }

  if (orgError) {
    return <div>Failed to load organization.</div>;
  }

  if (membersError) {
    return <div>Failed to load members.</div>;
  }

  const currentUserMember = members?.find(
    (member) => member.userId === user?.id,
  );

  const isOwner = currentUserMember?.role === 'owner';

  return (
    <Modal>
      <div>
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Organization</p>

            <h1 className="text-2xl font-semibold tracking-tight">
              {organization?.name}
            </h1>

            {organization?.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {organization.description}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                navigate(`/organizations/${organizationId}/members`)
              }
            >
              Members
            </Button>

            <Modal.Open opens="update-org">
              <Button>Update</Button>
            </Modal.Open>

            {isOwner && (
              <Modal.Open opens="delete-org">
                <Button variant="danger">Delete</Button>
              </Modal.Open>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Projects" value="0" />
          <StatCard title="Issues" value="0" />
          <StatCard title="Members" value={String(members?.length ?? 0)} />
          <StatCard title="Sprints" value="0" />
        </div>

        <Modal.Window name="update-org">
          {organizationId && <UpdateOrganizationForm orgId={organizationId} />}
        </Modal.Window>

        <Modal.Window name="delete-org">
          {organization && (
            <ConfirmDialog
              resourceName={`Organization ${organization.name}`}
              onConfirm={() => deleteOrg(organization.id)}
              disabled={isDeletingOrg}
            />
          )}
        </Modal.Window>
      </div>
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
