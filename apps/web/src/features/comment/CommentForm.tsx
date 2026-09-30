import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '../../ui/Button';
import { FormField } from '../../ui/FormField';

import {
  createCommentSchema,
  type CreateCommentFormData,
} from './comment.schema';

interface CommentFormProps {
  initialContent?: string;
  submitLabel?: string;
  isLoading?: boolean;
  onSubmit: (data: CreateCommentFormData) => void;
  onCancel?: () => void;
}

export default function CommentForm({
  initialContent = '',
  submitLabel = 'Add Comment',
  isLoading = false,
  onSubmit,
  onCancel,
}: CommentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCommentFormData>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      content: initialContent,
    },
  });

  useEffect(() => {
    reset({
      content: initialContent,
    });
  }, [initialContent, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Comment" error={errors.content?.message}>
        <textarea
          {...register('content')}
          rows={4}
          placeholder="Write a comment..."
          disabled={isLoading}
          className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
        />
      </FormField>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
