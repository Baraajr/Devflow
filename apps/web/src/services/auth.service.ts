import type {
  LoginFormValues,
  RegisterFormValues,
} from '../features/auth/auth.schema';

import type { User } from '../types/user';
import { apiRequest } from './api';

export function login(data: LoginFormValues): Promise<User> {
  return apiRequest<User>('/auth/login', {
    method: 'POST',
    data,
  });
}

export function register(data: RegisterFormValues): Promise<User> {
  return apiRequest<User>('/auth/register', {
    method: 'POST',
    data,
  });
}

export function getCurrentUser(): Promise<User> {
  return apiRequest<User>('/auth/me');
}

export function logout(): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/auth/logout', {
    method: 'POST',
  });
}
