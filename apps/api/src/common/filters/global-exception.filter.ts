import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import type { Request, Response } from 'express';

import type { ApiErrorDetail, ApiErrorResponse } from '../types/api-response';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const statusCode = this.getStatusCode(exception);

    const errorResponse = this.buildErrorResponse(exception, statusCode);

    this.logException(exception, request, statusCode);

    response.status(statusCode).json(errorResponse);
  }

  private getStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private buildErrorResponse(
    exception: unknown,
    statusCode: number,
  ): ApiErrorResponse {
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        return {
          error: {
            code: this.getDefaultErrorCode(statusCode),
            message: exceptionResponse,
            statusCode,
          },
        };
      }

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        return this.handleHttpExceptionResponse(exceptionResponse, statusCode);
      }
    }

    return {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      },
    };
  }

  private handleHttpExceptionResponse(
    exceptionResponse: object,
    statusCode: number,
  ): ApiErrorResponse {
    const response = exceptionResponse as {
      message?: string | string[];
      error?: string;
    };

    const message = Array.isArray(response.message)
      ? 'Request validation failed'
      : (response.message ?? 'Request failed');

    const details = Array.isArray(response.message)
      ? this.buildValidationDetails(response.message)
      : undefined;

    return {
      error: {
        code: this.getDefaultErrorCode(statusCode),
        message,
        statusCode,
        ...(details && { details }),
      },
    };
  }

  private buildValidationDetails(messages: string[]): ApiErrorDetail[] {
    return [
      {
        messages,
      },
    ];
  }

  private getDefaultErrorCode(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return 'BAD_REQUEST';

      case 401:
        return 'UNAUTHORIZED';

      case 403:
        return 'FORBIDDEN';

      case 404:
        return 'NOT_FOUND';

      case 409:
        return 'CONFLICT';

      case 422:
        return 'UNPROCESSABLE_ENTITY';

      case 429:
        return 'TOO_MANY_REQUESTS';

      default:
        return 'REQUEST_FAILED';
    }
  }

  private logException(
    exception: unknown,
    request: Request,
    statusCode: number,
  ): void {
    const method = request.method;
    const url = request.originalUrl;

    if (statusCode >= 500) {
      this.logger.error(
        `${method} ${url} - ${statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );

      return;
    }

    this.logger.warn(`${method} ${url} - ${statusCode}`);
  }
}
