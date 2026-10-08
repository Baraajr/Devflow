import type { Issue } from './issue';

export type SprintStatus = 'planned' | 'active' | 'completed';

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string | null;
  status: SprintStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  issues: Issue[];
}
