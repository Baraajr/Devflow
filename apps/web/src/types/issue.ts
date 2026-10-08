import type { Label } from './label';
import type { User } from './user';

export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';

export type IssueStatus = 'todo' | 'in_progress' | 'done';

export type IssueType = 'task' | 'bug' | 'story' | 'epic';

export interface Issue {
  id: string;
  projectId: string;

  reporterId: string;
  reporter: User;

  assigneeId: string | null;
  assignee: User | null;

  parentIssueId: string | null;

  title: string;
  description: string | null;

  issueType: IssueType;
  status: IssueStatus;
  priority: IssuePriority;

  issueNumber: number;

  labels: Label[];

  createdAt: string;
  updatedAt: string;
}

export type IssueSort =
  | 'issueNumber'
  | 'createdAt'
  | 'updatedAt'
  | 'title'
  | 'priority';

export type PaginationResult = {
  currentPage: number;
  limit: number;
  numberOfPages: number;
  total: number;
  next?: number;
  prev?: number;
};

export type IssueListResponse = {
  data: Issue[];
  pagination: PaginationResult;
};
