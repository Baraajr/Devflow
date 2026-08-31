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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  passwordConfirm: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  data: User;
}
