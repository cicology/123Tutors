import { SetMetadata } from '@nestjs/common';

export const AUDIT_ACTION_KEY = 'audit_action';
export const AUDIT_ENTITY_KEY = 'audit_entity';

export interface AuditOptions {
  action: string;
  entityType?: string;
  description?: string;
  module?: string;
  operation?: string;
}

export const AuditLog = (options: AuditOptions) => SetMetadata(AUDIT_ACTION_KEY, options);
export const AuditEntity = (entityType: string) => SetMetadata(AUDIT_ENTITY_KEY, entityType);



