import type {
  LoginFormValues,
  RegisterFormValues,
} from '../features/auth/auth.schema';

import type { User } from '../types/user';
import { apiRequest } from './api';

export function login(data: LoginFormValues) {
  return apiRequest<User>('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export function register(data: RegisterFormValues) {
  return apiRequest<User>('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export function getCurrentUser() {
  return apiRequest<User>('/auth/me');
}

export function logout() {
  return apiRequest<{ message: string }>('/auth/logout', {
    method: 'POST',
  });
}
