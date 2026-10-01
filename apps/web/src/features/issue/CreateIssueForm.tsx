import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useCreateIssue } from '../../hooks/useIssues';
import { isApiRequestError } from '../../services/api';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Textarea } from '../../ui/TextArea';
import { useModal } from '../../ui/ModalContext';

import { createIssueSchema, type CreateIssueFormData } from './issue.schema';

interface CreateIssueFormProps {
  projectId: string;
}

function CreateIssueForm({ projectId }: CreateIssueFormProps) {
  const { close } = useModal();

  const createIssue = useCreateIssue(projectId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<CreateIssueFormData>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: {
      title: '',
      description: '',
      issueType: 'task',
      priority: 'medium',
    },
  });

  const onSubmit = async (data: CreateIssueFormData) => {
    try {
      await createIssue.mutateAsync(data);

      reset();
      close();
    } catch (error) {
      if (!isApiRequestError(error)) {
        return;
      }

      if (error.details?.length) {
        error.details.forEach(({ field, messages }) => {
          if (field in data) {
            setError(field as keyof CreateIssueFormData, {
              type: 'server',
              message: messages[0],
            });
          }
        });

        return;
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-primary">Create issue</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Create a new issue for this project.
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

        {errors.issueType && (
          <p className="mt-1 text-sm text-red-500">
            {errors.issueType.message}
          </p>
        )}
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

        {errors.priority && (
          <p className="mt-1 text-sm text-red-500">{errors.priority.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={createIssue.isPending}
          loading={createIssue.isPending}
        >
          Create issue
        </Button>
      </div>
    </form>
  );
}

export default CreateIssueForm;
