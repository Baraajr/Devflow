import { z } from 'zod';

export const createIssueSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(255, 'Title must not exceed 255 characters'),

  description: z
    .string()
    .max(5000, 'Description must not exceed 5000 characters')
    .optional(),

  issueType: z.enum(['task', 'bug', 'story', 'epic']),

  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),

  parentIssueId: z.uuid().optional(),

  sprintId: z.uuid().optional(),
});

export const updateIssueSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(255, 'Title must not exceed 255 characters')
    .optional(),

  description: z
    .string()
    .max(5000, 'Description must not exceed 5000 characters')
    .optional(),

  issueType: z.enum(['task', 'bug', 'story', 'epic']).optional(),

  status: z.enum(['todo', 'in_progress', 'done']).optional(),

  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),

  parentIssueId: z.uuid().nullable().optional(),

  sprintId: z.uuid().optional(),
});

export type CreateIssueFormData = z.infer<typeof createIssueSchema>;
export type UpdateIssueFormData = z.infer<typeof updateIssueSchema>;
export const assignissueSchema = z.object({
  assigneeId: z.string().uuid().trim(),
});

export type AssignIssueFormValues = z.infer<typeof assignissueSchema>;
