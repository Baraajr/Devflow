import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useUpdateSprint } from '../../hooks/useSprints';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/TextArea';
import { useModal } from '../../ui/ModalContext';
import { isApiRequestError } from '../../services/api';

import { updateSprintSchema, type UpdateSprintFormData } from './sprint.schema';

interface UpdateSprintFormProps {
  projectId: string;
  sprintId: string;
  defaultValues: UpdateSprintFormData;
}

function UpdateSprintForm({
  projectId,
  sprintId,
  defaultValues,
}: UpdateSprintFormProps) {
  const { close } = useModal();

  const updateSprint = useUpdateSprint(projectId, sprintId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<UpdateSprintFormData>({
    resolver: zodResolver(updateSprintSchema),
    defaultValues,
  });

  const onSubmit = async (data: UpdateSprintFormData) => {
    try {
      await updateSprint.mutateAsync(data);

      close();
    } catch (error) {
      if (!isApiRequestError(error)) {
        return;
      }

      error.details?.forEach(({ field, messages }) => {
        if (field in data) {
          setError(field as keyof UpdateSprintFormData, {
            type: 'server',
            message: messages[0],
          });
        }
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-primary">Edit sprint</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Update the sprint details.
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

      {updateSprint.isError &&
        isApiRequestError(updateSprint.error) &&
        !updateSprint.error.details?.length && (
          <p className="text-sm text-red-500">{updateSprint.error.message}</p>
        )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={updateSprint.isPending}
          loading={updateSprint.isPending}
        >
          Save changes
        </Button>
      </div>
    </form>
  );
}

export default UpdateSprintForm;
