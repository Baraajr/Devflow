import type { User } from './user';

export type ProjectRole = 'admin' | 'developer' | 'viewer';

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  key: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface ProjectMembers {
  projectId: string;
  userId: string;
  organizationId: string;
  role: ProjectRole;
  joinedAt: string;
  project: Project;
  user: User;
}

export interface ProjectMember {
  id?: string;
  organizationId: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  user: User;
}
