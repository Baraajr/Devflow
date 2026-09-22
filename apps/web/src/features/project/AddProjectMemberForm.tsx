import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAddProjectMember } from '../../hooks/useProjects';

import { Button } from '../../ui/Button';
import { FormField } from '../../ui/FormField';
import { Select } from '../../ui/Select';
import { useModal } from '../../ui/ModalContext';

import {
  addprojectMemberSchema,
  type AddMemberFormValues,
} from './project.schema';
import type { OrganizationMember } from '../../types/organization';

interface AddProjectMemberFormProps {
  projectId: string;
  orgMembers: OrganizationMember[];
}

function AddProjectMemberForm({
  projectId,
  orgMembers = [],
}: AddProjectMemberFormProps) {
  const addMutation = useAddProjectMember(projectId);
  const { close } = useModal();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddMemberFormValues>({
    resolver: zodResolver(addprojectMemberSchema),
    mode: 'onChange',
    defaultValues: {
      userId: '',
      role: 'viewer',
    },
  });

  const onSubmit = async (data: AddMemberFormValues) => {
    try {
      await addMutation.mutateAsync(data);
      close();
    } catch {
      // Error toast is already handled by useAddProjectMember.
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">
          Add project member
        </h2>

        <p className="text-sm text-muted-foreground">
          Add an organization member to this project and assign their role.
        </p>
      </div>

      <div className="space-y-5">
        <FormField
          label="Member"
          htmlFor="userId"
          error={errors.userId?.message}
          required
        >
          <Select id="userId" {...register('userId')}>
            <option value="">Select a member</option>

            {orgMembers?.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.user.firstName} {member.user.lastName} (
                {member.user.email})
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Project role"
          htmlFor="role"
          error={errors.role?.message}
          required
        >
          <Select id="role" {...register('role')}>
            <option value="viewer">Viewer</option>
            <option value="developer">Developer</option>
            <option value="admin">Admin</option>
          </Select>
        </FormField>
      </div>

      <div className="flex justify-end border-t pt-5">
        <Button
          type="submit"
          disabled={addMutation.isPending}
          className="min-w-32"
          loading={addMutation.isPending}
        >
          Add member
        </Button>
      </div>
    </form>
  );
}

export default AddProjectMemberForm;
