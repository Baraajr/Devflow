export interface ApiErrorDetail {
  field?: string;
  messages: string[];
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: ApiErrorDetail[];
    requestId?: string;
  };
}
