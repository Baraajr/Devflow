import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useCreateSprint } from '../../hooks/useSprints';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/TextArea';
import { useModal } from '../../ui/ModalContext';

import { createSprintSchema, type CreateSprintFormData } from './sprint.schema';
import { isApiRequestError } from '../../services/api';

interface CreateSprintFormProps {
  projectId: string;
}

function CreateSprintForm({ projectId }: CreateSprintFormProps) {
  const { close } = useModal();

  const createSprint = useCreateSprint(projectId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<CreateSprintFormData>({
    resolver: zodResolver(createSprintSchema),
    defaultValues: {
      name: '',
      goal: '',
      startDate: '',
      endDate: '',
    },
  });

  const onSubmit = async (data: CreateSprintFormData) => {
    try {
      await createSprint.mutateAsync(data);

      reset();
      close();
    } catch (error) {
      if (!isApiRequestError(error)) {
        return;
      }

      error.details?.forEach(({ field, messages }) => {
        setError(field as keyof CreateSprintFormData, {
          type: 'server',
          message: messages[0],
        });
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-primary">Create sprint</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Create a new sprint for this project.
        </p>
      </div>

      <div>
        <Input
          placeholder="Sprint name"
          {...register('name')}
          error={!!errors.name}
        />

        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Textarea
          placeholder="Sprint goal..."
          rows={4}
          {...register('goal')}
          error={!!errors.goal}
        />

        {errors.goal && (
          <p className="mt-1 text-sm text-red-500">{errors.goal.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="startDate"
          className="mb-1 block text-sm font-medium text-primary"
        >
          Start date
        </label>

        <Input
          id="startDate"
          type="date"
          {...register('startDate')}
          error={!!errors.startDate}
        />

        {errors.startDate && (
          <p className="mt-1 text-sm text-red-500">
            {errors.startDate.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="endDate"
          className="mb-1 block text-sm font-medium text-primary"
        >
          End date
        </label>

        <Input
          id="endDate"
          type="date"
          {...register('endDate')}
          error={!!errors.endDate}
        />

        {errors.endDate && (
          <p className="mt-1 text-sm text-red-500">{errors.endDate.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={createSprint.isPending}
          loading={createSprint.isPending}
        >
          Create sprint
        </Button>
      </div>
    </form>
  );
}

export default CreateSprintForm;
