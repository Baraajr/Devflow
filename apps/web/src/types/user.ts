export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
