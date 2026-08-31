import type { ApiError } from '../types/api-error';

interface ApiErrorResponse {
  error: ApiError;
}

export class ApiRequestError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly details?: ApiError['details'];

  constructor(error: ApiError) {
    super(error.message);

    this.name = 'ApiRequestError';
    this.code = error.code;
    this.statusCode = error.statusCode;
    this.details = error.details;
  }
}

const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const url =
    typeof input === 'string' && input.startsWith('/')
      ? `${API_URL}${input}`
      : input;

  const response = await fetch(url, {
    ...init,
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    const errorResponse = data as ApiErrorResponse;
    throw new ApiRequestError(errorResponse.error);
  }

  return data;
}
