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
}

export interface CreateProjectInput {
  name: string;
  key: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  key?: string;
  description?: string | null;
}

export interface AddProjectMemberInput {
  userId: string;
  role: ProjectRole;
}

export interface ProjectListResponse {
  data: Project[];
  total: number;
  page: number;
  limit: number;
}
