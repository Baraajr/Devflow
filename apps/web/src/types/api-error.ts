export interface ApiErrorDetail {
  field?: string;
  messages: string[];
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: ApiErrorDetail[];
}
