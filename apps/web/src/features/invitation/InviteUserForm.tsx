import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '../../ui/Button';
import { FormField } from '../../ui/FormField';
import { Input } from '../../ui/Input';
import { useModal } from '../../ui/ModalContext';

import { useInviteMember } from '../../hooks/useInviteMember';
import {
  invitationSchema,
  type invitationFormValues,
} from './invitation.schema';

interface InviteUserFormProps {
  orgId: string;
}

function InviteUserForm({ orgId }: InviteUserFormProps) {
  const inviteMutation = useInviteMember();
  const { close } = useModal();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<invitationFormValues>({
    resolver: zodResolver(invitationSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: invitationFormValues) => {
    try {
      await inviteMutation.mutateAsync({
        orgId,
        data,
      });

      close();
    } catch {
      // Error toast is already handled by useInviteMember
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Invite Member</h2>

        <p className="text-sm text-muted-foreground">
          Add a member to your workspace.
        </p>
      </div>

      <div className="space-y-5">
        <FormField
          label="Member email"
          htmlFor="invitedUserEmail"
          error={errors.invitedUserEmail?.message}
          required
        >
          <Input
            id="invitedUserEmail"
            type="email"
            placeholder="member@example.com"
            autoComplete="email"
            error={!!errors.invitedUserEmail}
            {...register('invitedUserEmail')}
          />
        </FormField>

        <FormField
          label="Role"
          htmlFor="role"
          error={errors.role?.message}
          required
        >
          <select
            id="role"
            className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            {...register('role')}
          >
            <option value="">Select a role</option>
            <option value="manager">Manager</option>
            <option value="developer">Developer</option>
            <option value="viewer">Viewer</option>
          </select>
        </FormField>
      </div>

      <div className="flex justify-end border-t pt-5">
        <Button
          type="submit"
          disabled={inviteMutation.isPending}
          className="min-w-32"
        >
          {inviteMutation.isPending ? 'Sending...' : 'Send invitation'}
        </Button>
      </div>
    </form>
  );
}

export default InviteUserForm;
