import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '../../ui/Button';
import { FormField } from '../../ui/FormField';
import { Select } from '../../ui/Select';
import { useModal } from '../../ui/ModalContext';

import { useAssignIssue } from '../../hooks/useIssues';

import { assignissueSchema, type AssignIssueFormValues } from './issue.schema';

import type { ProjectMember } from '../../types/project';

interface AssignIssueFormProps {
  projectId: string;
  issueId: string;
  projectMembers: ProjectMember[];
}

function AssignIssueForm({
  projectId,
  issueId,
  projectMembers = [],
}: AssignIssueFormProps) {
  const developers = projectMembers.filter(
    (member) => member.role === 'developer',
  );

  const assignMutation = useAssignIssue(projectId);
  const { close } = useModal();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignIssueFormValues>({
    resolver: zodResolver(assignissueSchema),
    mode: 'onChange',
    defaultValues: {
      assigneeId: '',
    },
  });

  const onSubmit = async (data: AssignIssueFormValues) => {
    try {
      await assignMutation.mutateAsync({
        issueId,
        assigneeId: data.assigneeId,
      });

      close();
    } catch {
      // Error toast is already handled by the mutation.
    }
  };

  if (developers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Assign Issue</h2>

          <p className="text-sm text-muted-foreground">
            Assign this issue to a project developer.
          </p>
        </div>

        <div className="rounded-md border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            There are no developers in this project to assign this issue to.
          </p>
        </div>

        <div className="flex justify-end border-t pt-5">
          <Button type="button" variant="ghost" onClick={close}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Assign Issue</h2>

        <p className="text-sm text-muted-foreground">
          Assign this issue to a project developer.
        </p>
      </div>

      <FormField
        label="Developer"
        htmlFor="assigneeId"
        error={errors.assigneeId?.message}
        required
      >
        <Select id="assigneeId" {...register('assigneeId')}>
          <option value="">Select a developer</option>

          {developers.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.user.firstName} {member.user.lastName} (
              {member.user.email})
            </option>
          ))}
        </Select>
      </FormField>

      <div className="flex justify-end border-t pt-5">
        <Button
          type="submit"
          disabled={assignMutation.isPending}
          loading={assignMutation.isPending}
          className="min-w-32"
        >
          Assign
        </Button>
      </div>
    </form>
  );
}

export default AssignIssueForm;
