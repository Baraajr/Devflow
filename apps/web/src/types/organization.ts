export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  userId: string;
  memberCount: number;
}
