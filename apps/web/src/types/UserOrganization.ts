export interface UserOrganization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  userId: string;
  role: string;
  memberCount: number;
}
