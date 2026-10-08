import { z } from 'zod';

export const createSprintSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Sprint name must be at least 2 characters')
      .max(150, 'Sprint name cannot exceed 150 characters'),

    goal: z
      .string()
      .trim()
      .max(500, 'Goal cannot exceed 500 characters')
      .optional(),

    startDate: z.string().optional(),

    endDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) {
        return true;
      }

      return data.startDate <= data.endDate;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    },
  );

export const updateSprintSchema = createSprintSchema;

export type CreateSprintFormData = z.infer<typeof createSprintSchema>;

export type UpdateSprintFormData = z.infer<typeof updateSprintSchema>;
