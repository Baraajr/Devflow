import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '../../ui/Button';
import { FormField } from '../../ui/FormField';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/TextArea';
import { useModal } from '../../ui/ModalContext';
import { useProject, useUpdateProject } from '../../hooks/useProjects';

import type { UpdateProjectInput } from '../../types/project';
import {
  updateProjectSchema,
  type UpdateProjectFormValues,
} from './project.schema';

interface UpdateProjectFormProps {
  organizationId: string;
  projectId: string;
}

function UpdateProjectForm({
  organizationId,
  projectId,
}: UpdateProjectFormProps) {
  // Fetch existing project data to pre-fill the form
  const { data: project } = useProject(projectId);
  const updateMutation = useUpdateProject(organizationId, projectId);
  const { close } = useModal();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProjectFormValues>({
    resolver: zodResolver(updateProjectSchema),
    mode: 'onChange',
    // 'values' dynamically updates form fields when project data loads asynchronously
    values: {
      name: project?.name ?? '',
      key: project?.key ?? '',
      description: project?.description ?? '',
    },
  });

  const onSubmit = async (data: UpdateProjectFormValues) => {
    const payload: UpdateProjectInput = {
      ...(data.name && { name: data.name.trim() }),
      ...(data.key && { key: data.key.trim().toUpperCase() }),
      ...(data.description !== undefined && {
        description: data.description.trim() || undefined,
      }),
    };

    try {
      await updateMutation.mutateAsync(payload);
      close();
    } catch {
      // Error toast is handled by useUpdateProject mutation.
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Update project</h2>
      </div>

      <div className="space-y-5">
        <FormField
          label="Project name"
          htmlFor="name"
          error={errors.name?.message}
          required
        >
          <Input
            id="name"
            type="text"
            placeholder="e.g. DevFlow"
            autoComplete="off"
            error={!!errors.name}
            {...register('name')}
          />
        </FormField>

        <FormField
          label="Project key"
          htmlFor="key"
          error={errors.key?.message}
          required
        >
          <Input
            id="key"
            type="text"
            placeholder="e.g. DEV"
            autoComplete="off"
            maxLength={10}
            error={!!errors.key}
            className="uppercase"
            {...register('key')}
          />

          <p className="mt-1.5 text-xs text-muted-foreground">
            A short identifier used for issues, for example{' '}
            <span className="font-medium">DEV-123</span>.
          </p>
        </FormField>

        <FormField
          label="Description"
          htmlFor="description"
          error={errors.description?.message}
        >
          <Textarea
            id="description"
            placeholder="What is this project about?"
            rows={4}
            error={!!errors.description}
            {...register('description')}
          />
        </FormField>
      </div>

      <div className="flex justify-end border-t pt-5">
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="min-w-32"
          loading={updateMutation.isPending}
        >
          Update project
        </Button>
      </div>
    </form>
  );
}

export default UpdateProjectForm;
