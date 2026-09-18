import z from 'zod';

export const invitationSchema = z.object({
  invitedUserEmail: z.string().min(1, 'Email is required'),
  role: z.enum(['manager', 'viewer', 'developer']),
});

export type invitationFormValues = z.infer<typeof invitationSchema>;
