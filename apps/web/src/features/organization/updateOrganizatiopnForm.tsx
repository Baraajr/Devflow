import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '../../ui/Button';
import { FormField } from '../../ui/FormField';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/TextArea';
import { useModal } from '../../ui/ModalContext';
import { useUpdateOrganization } from '../../hooks/useUpdateOrganization';

import {
  createOrgSchema,
  type CreateOrgFormValues,
} from './organization.schema';

interface UpdateOrganizationFormProps {
  orgId: string;
}

function UpdateOrganizationForm({ orgId }: UpdateOrganizationFormProps) {
  const updateMutation = useUpdateOrganization();
  const { close } = useModal();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrgFormValues>({
    resolver: zodResolver(createOrgSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: CreateOrgFormValues) => {
    try {
      await updateMutation.mutateAsync({
        orgId: orgId,
        data,
      });

      close();
    } catch {
      // Error toast is already handled by useUpdateOrganization
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">
          Update organization
        </h2>

        <p className="text-sm text-muted-foreground">
          Update your organization name and description.
        </p>
      </div>

      <div className="space-y-5">
        <FormField
          label="Organization name"
          htmlFor="name"
          error={errors.name?.message}
          required
        >
          <Input
            id="name"
            type="text"
            placeholder="e.g. Acme Engineering"
            autoComplete="organization"
            error={!!errors.name}
            {...register('name')}
          />
        </FormField>

        <FormField
          label="Description"
          htmlFor="description"
          error={errors.description?.message}
        >
          <Textarea
            id="description"
            placeholder="What is this organization about?"
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
        >
          {updateMutation.isPending ? 'Updating...' : 'Update organization'}
        </Button>
      </div>
    </form>
  );
}

export default UpdateOrganizationForm;
