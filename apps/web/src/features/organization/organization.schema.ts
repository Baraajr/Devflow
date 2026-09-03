import z from 'zod';

export const createOrgSchema = z.object({
  name: z
    .string()
    .min(3, 'Organization name must be at least 3 characters long')
    .max(150, 'Organization name must not be longer than 150 characters'),

  description: z
    .string()
    .max(500, 'Organization name must not be longer than 500 characters'),
});

export type CreateOrgFormValues = z.infer<typeof createOrgSchema>;
