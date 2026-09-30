import { z } from 'zod';

export const createLabelSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Label name is required')
    .max(50, 'Label name must be at most 50 characters'),

  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color'),
});

export type CreateLabelFormData = z.infer<typeof createLabelSchema>;
