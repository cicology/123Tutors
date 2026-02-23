import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { AuditService, AuditLogData } from './audit.service';
import { AUDIT_ACTION_KEY, AUDIT_ENTITY_KEY } from './audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const handler = context.getHandler();
    const controller = context.getClass();

    const startTime = Date.now();
    const auditOptions = this.reflector.get(AUDIT_ACTION_KEY, handler);
    const entityType = this.reflector.get(AUDIT_ENTITY_KEY, handler) || 
                      this.reflector.get(AUDIT_ENTITY_KEY, controller);

    // Extract user information from request
    const user = request.user || {};
    const userEmail = user.email || user.userEmail || request.headers['x-user-email'];
    const userRole = user.role || user.userRole;
    const userId = user.id || user.userId;

    // Extract bursary information from multiple sources
    const bursaryName = user.bursaryName || 
                       request.headers['x-bursary-name'] || 
                       request.body?.bursaryName || 
                       request.query?.bursaryName ||
                       request.body?.bursary ||
                       request.params?.bursary;

    return next.handle().pipe(
      tap(async (data) => {
        const executionTime = Date.now() - startTime;

        if (auditOptions) {
          // Extract bursaryName and studentEmail from response data if not already set
          const finalBursaryName = bursaryName || data?.bursary || data?.bursaryName;
          const finalStudentEmail = this.extractStudentEmail(request, data) || data?.studentEmail;

          const auditData: AuditLogData = {
            userId,
            userEmail,
            userRole,
            action: auditOptions.action,
            entityType: auditOptions.entityType || entityType,
            entityId: this.extractEntityId(request, data),
            bursaryName: finalBursaryName,
            studentEmail: finalStudentEmail,
            description: auditOptions.description || `${auditOptions.action} operation`,
            oldValues: this.extractOldValues(request),
            newValues: this.extractNewValues(request, data),
            ipAddress: request.ip || request.connection.remoteAddress,
            userAgent: request.headers['user-agent'],
            requestId: request.headers['x-request-id'],
            status: 'success',
            executionTimeMs: executionTime,
            module: auditOptions.module || controller.name,
            operation: auditOptions.operation || handler.name,
            metadata: {
              method: request.method,
              url: request.url,
              statusCode: response.statusCode,
            },
          };

          await this.auditService.logAudit(auditData);
        }
      }),
      catchError(async (error) => {
        const executionTime = Date.now() - startTime;

        if (auditOptions) {
          // Re-extract bursary name for error case (in case it wasn't captured earlier)
          const errorBursaryName = user.bursaryName || 
                                  request.headers['x-bursary-name'] || 
                                  request.body?.bursaryName || 
                                  request.query?.bursaryName;
          
          const auditData: AuditLogData = {
            userId,
            userEmail,
            userRole,
            action: auditOptions.action,
            entityType: auditOptions.entityType || entityType,
            entityId: this.extractEntityId(request),
            bursaryName: errorBursaryName,
            studentEmail: this.extractStudentEmail(request),
            description: auditOptions.description || `${auditOptions.action} operation failed`,
            oldValues: this.extractOldValues(request),
            newValues: this.extractNewValues(request),
            ipAddress: request.ip || request.connection.remoteAddress,
            userAgent: request.headers['user-agent'],
            requestId: request.headers['x-request-id'],
            status: 'error',
            errorMessage: error.message,
            executionTimeMs: executionTime,
            module: auditOptions.module || controller.name,
            operation: auditOptions.operation || handler.name,
            metadata: {
              method: request.method,
              url: request.url,
              statusCode: error.status || 500,
            },
          };

          await this.auditService.logAudit(auditData);
        }

        return throwError(() => error);
      }),
    );
  }

  private extractEntityId(request: any, data?: any): string | undefined {
    // Try to extract entity ID from various sources
    return request.params?.id || 
           request.params?.uniqueId || 
           data?.uniqueId || 
           data?.id ||
           request.body?.uniqueId ||
           request.body?.id;
  }

  private extractStudentEmail(request: any, data?: any): string | undefined {
    // Try multiple sources, including response data
    return request.params?.studentEmail ||
           request.body?.studentEmail ||
           data?.studentEmail ||
           data?.student?.studentEmail ||
           request.query?.studentEmail;
  }

  private extractOldValues(request: any): any {
    // For update operations, try to get old values
    if (request.method === 'PUT' || request.method === 'PATCH') {
      return request.oldValues || null;
    }
    return null;
  }

  private extractNewValues(request: any, data?: any): any {
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
      return request.body || data || null;
    }
    return null;
  }
}
