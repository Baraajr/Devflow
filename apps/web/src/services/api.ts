import axios, { type AxiosRequestConfig } from 'axios';

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

    Object.setPrototypeOf(this, ApiRequestError.prototype);
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export async function apiRequest<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const response = await api.request<T>({
      url,
      ...config,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      const apiError = error.response?.data?.error;

      if (apiError) {
        throw new ApiRequestError(apiError);
      }
    }

    throw error;
  }
}
