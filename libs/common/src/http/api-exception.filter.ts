import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ErrorResponseDto } from './error-response.dto';

type ErrorClass = abstract new (...args: never[]) => Error;

/** Maps error classes thrown by the inner layers to HTTP status codes. */
export type ErrorStatusMap = ReadonlyArray<readonly [ErrorClass, HttpStatus]>;

/**
 * Turns any exception into a consistent JSON error body. Errors that are not
 * HTTP exceptions nor listed in the map become a 500 without internal details.
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  constructor(private readonly errorStatuses: ErrorStatusMap = []) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const { statusCode, message } = this.resolve(exception);

    const body: ErrorResponseDto = {
      statusCode,
      error: this.reasonPhrase(statusCode),
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };
    http.getResponse<Response>().status(statusCode).json(body);
  }

  private resolve(exception: unknown): {
    statusCode: number;
    message: string | string[];
  } {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const message =
        typeof response === 'object' && 'message' in response
          ? (response.message as string | string[])
          : exception.message;
      return { statusCode: exception.getStatus(), message };
    }

    const mapped = this.errorStatuses.find(
      ([errorClass]) => exception instanceof errorClass,
    );
    if (mapped) {
      return { statusCode: mapped[1], message: (exception as Error).message };
    }

    this.logger.error(
      'Unexpected error',
      exception instanceof Error ? exception.stack : String(exception),
    );
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }

  private reasonPhrase(statusCode: number): string {
    const name = HttpStatus[statusCode] as string | undefined;
    return name
      ? name
          .split('_')
          .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
          .join(' ')
      : 'Error';
  }
}
