import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '../../ui/Button';
import Modal from '../../ui/Modal';

import { type OrganizationRole } from '../../types/organization';

import { updateMemberRole } from '../../services/organization.service';
import { useModal } from '../../ui/ModalContext';

type EditableRole = Exclude<OrganizationRole, 'owner'>;

interface ChangeMemberRoleFormProps {
  organizationId: string;
  userId: string;
  currentRole: OrganizationRole;
}

interface FormValues {
  role: EditableRole;
}

const roles: {
  value: EditableRole;
  label: string;
  description: string;
}[] = [
  {
    value: 'manager',
    label: 'Manager',
    description: 'Can manage projects and organization members.',
  },
  {
    value: 'developer',
    label: 'Developer',
    description: 'Can work on projects and issues.',
  },
  {
    value: 'viewer',
    label: 'Viewer',
    description: 'Can view organization content.',
  },
];

function ChangeMemberRoleForm({
  organizationId,
  userId,
  currentRole,
}: ChangeMemberRoleFormProps) {
  const queryClient = useQueryClient();
  const { close } = useModal();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      role: currentRole === 'owner' ? 'developer' : currentRole,
    },
  });

  useEffect(() => {
    reset({
      role: currentRole === 'owner' ? 'developer' : currentRole,
    });
  }, [currentRole, reset]);

  const { mutate: changeRole, isPending } = useMutation({
    mutationFn: (data: FormValues) =>
      updateMemberRole(organizationId, userId, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['organization', organizationId, 'members'],
      });

      close();

      toast.success('Member role updated successfully');
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: FormValues) => {
    changeRole(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Change member role</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Choose the role this member should have in the organization.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-3">
          {roles.map((role) => (
            <label
              key={role.value}
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition hover:bg-muted/40"
            >
              <input
                type="radio"
                value={role.value}
                {...register('role')}
                className="mt-1"
              />

              <div>
                <p className="text-sm font-medium">{role.label}</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {role.description}
                </p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Modal.Close>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Modal.Close>

          <Button
            type="submit"
            disabled={isPending || !isDirty}
            loading={isPending}
          >
            Update role
          </Button>
        </div>
      </form>
    </div>
  );
}
export default ChangeMemberRoleForm;
