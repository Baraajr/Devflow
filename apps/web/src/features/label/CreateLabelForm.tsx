import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useCreateLabel } from '../../hooks/useLabels';
import { isApiRequestError } from '../../services/api';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { useModal } from '../../ui/ModalContext';

import { createLabelSchema, type CreateLabelFormData } from './label.schema';

interface CreateLabelFormProps {
  projectId: string;
}

function CreateLabelForm({ projectId }: CreateLabelFormProps) {
  const { close } = useModal();

  const createLabel = useCreateLabel(projectId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<CreateLabelFormData>({
    resolver: zodResolver(createLabelSchema),
    defaultValues: {
      name: '',
      color: '#000000',
    },
  });

  const onSubmit = async (data: CreateLabelFormData) => {
    try {
      await createLabel.mutateAsync(data);

      reset();
      close();
    } catch (error) {
      if (!isApiRequestError(error) || !error.details?.length) {
        return;
      }

      error.details.forEach(({ field, messages }) => {
        if (field in data) {
          setError(field as keyof CreateLabelFormData, {
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
        <h2 className="text-lg font-semibold text-primary">Create label</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Create a label for this project.
        </p>
      </div>

      <div>
        <Input
          placeholder="Label name"
          {...register('name')}
          error={!!errors.name}
        />

        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="color"
          className="mb-1 block text-sm font-medium text-primary"
        >
          Color
        </label>

        <div className="flex items-center gap-3">
          <input
            id="color"
            type="color"
            {...register('color')}
            className="h-10 w-12 cursor-pointer rounded border border-border bg-transparent"
          />

          <Input
            {...register('color')}
            placeholder="#000000"
            error={!!errors.color}
          />
        </div>

        {errors.color && (
          <p className="mt-1 text-sm text-red-500">{errors.color.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={createLabel.isPending}
          loading={createLabel.isPending}
        >
          Create label
        </Button>
      </div>
    </form>
  );
}

export default CreateLabelForm;
