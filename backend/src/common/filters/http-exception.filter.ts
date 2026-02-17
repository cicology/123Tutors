import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Log error details for debugging
    if (!(exception instanceof HttpException)) {
      console.error('[AllExceptionsFilter] Unhandled exception:', exception);
      if (exception instanceof Error) {
        console.error('[AllExceptionsFilter] Error stack:', exception.stack);
      }
    } else {
      console.error('[AllExceptionsFilter] HttpException:', status, message);
    }

    response.status(status).json({
      statusCode: status,
      message: typeof message === 'string' ? message : (message as any).message || message,
      timestamp: new Date().toISOString(),
    });
  }
}

