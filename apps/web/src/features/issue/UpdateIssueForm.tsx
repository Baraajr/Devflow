import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useUpdateIssue } from '../../hooks/useIssues';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { updateIssueSchema, type UpdateIssueFormData } from './issue.schema';
import { Textarea } from '../../ui/TextArea';
import { useModal } from '../../ui/ModalContext';

interface UpdateIssueFormProps {
  projectId: string;
  issueId: string;
  defaultValues: UpdateIssueFormData;
}

function UpdateIssueForm({
  projectId,
  issueId,
  defaultValues,
}: UpdateIssueFormProps) {
  const { close } = useModal();
  const updateIssue = useUpdateIssue(projectId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateIssueFormData>({
    resolver: zodResolver(updateIssueSchema),
    defaultValues,
  });

  const onSubmit = async (data: UpdateIssueFormData) => {
    try {
      await updateIssue.mutateAsync({
        issueId,
        data,
      });
      close();
    } catch (error) {
      // Error toast is already handled by the mutation.
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-primary">Edit issue</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Update the issue details.
        </p>
      </div>

      <div>
        <Input
          placeholder="Issue title"
          {...register('title')}
          error={!!errors.title}
        />

        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Textarea
          placeholder="Describe the issue..."
          rows={5}
          {...register('description')}
          error={!!errors.description}
        />

        {errors.description && (
          <p className="mt-1 text-sm text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="issueType"
          className="mb-1 block text-sm font-medium text-primary"
        >
          Issue type
        </label>

        <Select id="issueType" {...register('issueType')}>
          <option value="task">Task</option>
          <option value="bug">Bug</option>
          <option value="story">Story</option>
          <option value="epic">Epic</option>
        </Select>
      </div>

      <div>
        <label
          htmlFor="status"
          className="mb-1 block text-sm font-medium text-primary"
        >
          Status
        </label>

        <Select id="status" {...register('status')}>
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </Select>
      </div>

      <div>
        <label
          htmlFor="priority"
          className="mb-1 block text-sm font-medium text-primary"
        >
          Priority
        </label>

        <Select id="priority" {...register('priority')}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </Select>
      </div>

      {updateIssue.isError && (
        <p className="text-sm text-red-500">{updateIssue.error.message}</p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={updateIssue.isPending}>
          {updateIssue.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}

export default UpdateIssueForm;
