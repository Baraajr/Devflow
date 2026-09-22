import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '../../ui/Button';
import Modal from '../../ui/Modal';

import type { ProjectRole } from '../../types/project';
import { useUpdateProjectMemberRole } from '../../hooks/useProjects';

interface ChangeMemberRoleFormProps {
  projectId: string;
  userId: string;
  currentRole: ProjectRole;
}

interface FormValues {
  role: ProjectRole;
}

const roles: {
  value: ProjectRole;
  label: string;
  description: string;
}[] = [
  {
    value: 'admin',
    label: 'Admin',
    description: 'Can manage projects.',
  },
  {
    value: 'developer',
    label: 'Developer',
    description: 'Can work on projects and issues.',
  },
  {
    value: 'viewer',
    label: 'Viewer',
    description: 'Can view project content.',
  },
];

export default function ChangeMemberRoleForm({
  projectId,
  userId,
  currentRole,
}: ChangeMemberRoleFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      role: currentRole,
    },
  });

  useEffect(() => {
    reset({
      role: currentRole,
    });
  }, [currentRole, reset]);

  const { mutate: changeRole, isPending } =
    useUpdateProjectMemberRole(projectId);

  const onSubmit = (data: FormValues) => {
    changeRole({ memberUserId: userId, role: data.role });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Change member role</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Choose the role this member should have in the project.
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
