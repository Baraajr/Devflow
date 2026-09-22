import z from 'zod';

export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Project name must be at least 2 characters')
    .max(150, 'Project name must be less than 150 characters'),

  key: z
    .string()
    .trim()
    .min(2, 'Project key must be at least 2 characters')
    .max(10, 'Project key must be less than 10 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Project key can only contain letters, numbers, _ or -',
    ),

  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

// Update schema (makes all fields optional while keeping their validation rules)
export const updateProjectSchema = projectSchema.partial();

export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;

export const addprojectMemberSchema = z.object({
  userId: z.string().uuid().trim(),
  role: z.enum(['admin', 'developer', 'viewer']),
});

export type AddMemberFormValues = z.infer<typeof addprojectMemberSchema>;
