import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryColumn({ name: 'unique_id' })
  uniqueId: string;

  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId: string;

  @Column({ name: 'user_email', nullable: true })
  @Index()
  userEmail: string;

  @Column({ name: 'user_role', nullable: true })
  userRole: string;

  @Column({ name: 'action', nullable: false })
  @Index()
  action: string;

  @Column({ name: 'entity_type', nullable: true })
  @Index()
  entityType: string;

  @Column({ name: 'entity_id', nullable: true })
  @Index()
  entityId: string;

  @Column({ name: 'bursary_name', nullable: true })
  @Index()
  bursaryName: string;

  @Column({ name: 'student_email', nullable: true })
  @Index()
  studentEmail: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues: any;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues: any;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ name: 'request_id', nullable: true })
  requestId: string;

  @Column({ name: 'status', default: 'success' })
  status: 'success' | 'error' | 'warning';

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'execution_time_ms', type: 'int', nullable: true })
  executionTimeMs: number;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;

  @Column({ name: 'module', nullable: true })
  @Index()
  module: string;

  @Column({ name: 'operation', nullable: true })
  @Index()
  operation: string;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: any;
}



