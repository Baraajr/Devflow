import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '../../ui/Button';
import { FormField } from '../../ui/FormField';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/TextArea';
import { useModal } from '../../ui/ModalContext';
import { useCreateProject } from '../../hooks/useProjects';

import type { CreateProjectInput } from '../../types/project';
import { projectSchema, type ProjectFormValues } from './project.schema';

interface CreateProjectFormProps {
  organizationId: string;
}

function CreateProjectForm({ organizationId }: CreateProjectFormProps) {
  const createMutation = useCreateProject(organizationId);
  const { close } = useModal();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      key: '',
      description: '',
    },
  });

  const onSubmit = async (data: ProjectFormValues) => {
    const payload: CreateProjectInput = {
      name: data.name.trim(),
      key: data.key.trim().toUpperCase(),
      description: data.description?.trim() || undefined,
    };

    try {
      await createMutation.mutateAsync(payload);
      close();
    } catch {
      // Error toast is already handled by useCreateProject.
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Create project</h2>

        <p className="text-sm text-muted-foreground">
          Create a project to organize your team&apos;s work, issues, and
          sprints.
        </p>
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
          disabled={createMutation.isPending}
          className="min-w-32"
        >
          {createMutation.isPending ? 'Creating...' : 'Create project'}
        </Button>
      </div>
    </form>
  );
}

export default CreateProjectForm;
