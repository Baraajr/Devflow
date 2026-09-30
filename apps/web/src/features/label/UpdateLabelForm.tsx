import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useUpdateLabel } from '../../hooks/useLabels';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { useModal } from '../../ui/ModalContext';

import { createLabelSchema, type CreateLabelFormData } from './label.schema';

import type { Label } from '../../types/label';

interface UpdateLabelFormProps {
  projectId: string;
  label: Label;
}

function UpdateLabelForm({ projectId, label }: UpdateLabelFormProps) {
  const { close } = useModal();

  const updateLabel = useUpdateLabel(projectId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateLabelFormData>({
    resolver: zodResolver(createLabelSchema),
    defaultValues: {
      name: label.name,
      color: label.color,
    },
  });

  const onSubmit = async (data: CreateLabelFormData) => {
    try {
      await updateLabel.mutateAsync({
        labelId: label.id,
        data,
      });

      close();
    } catch {
      // Error toast is already handled by the mutation.
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-primary">Edit label</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Update this project label.
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

      {updateLabel.isError && (
        <p className="text-sm text-red-500">{updateLabel.error.message}</p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={updateLabel.isPending}
          loading={updateLabel.isPending}
        >
          Save changes
        </Button>
      </div>
    </form>
  );
}

export default UpdateLabelForm;
