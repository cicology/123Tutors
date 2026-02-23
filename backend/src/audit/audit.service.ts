import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit.entity';

export interface AuditLogData {
  uniqueId?: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  bursaryName?: string;
  studentEmail?: string;
  description?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  status?: 'success' | 'error' | 'warning';
  errorMessage?: string;
  executionTimeMs?: number;
  module?: string;
  operation?: string;
  metadata?: any;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private auditQueue: AuditLogData[] = [];
  private isProcessing = false;

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {
    // Start processing queue every 5 seconds
    setInterval(() => this.processQueue(), 5000);
  }

  /**
   * Log an audit event asynchronously
   */
  async logAudit(auditData: AuditLogData): Promise<void> {
    try {
      // Add to queue for asynchronous processing
      this.auditQueue.push({
        ...auditData,
        uniqueId: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });

      // If queue is getting large, process immediately
      if (this.auditQueue.length > 100) {
        await this.processQueue();
      }
    } catch (error) {
      this.logger.error('Failed to queue audit log:', error);
    }
  }

  /**
   * Process the audit queue asynchronously
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.auditQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const batch = this.auditQueue.splice(0, 50); // Process in batches of 50
      
      if (batch.length > 0) {
        await this.auditRepository.save(batch);
        this.logger.debug(`Processed ${batch.length} audit logs`);
      }
    } catch (error) {
      this.logger.error('Failed to process audit queue:', error);
      // Put failed items back in queue
      this.auditQueue.unshift(...this.auditQueue);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get recent activities for a specific bursary or all activities for admin
   */
  async getRecentActivities(
    bursaryName?: string,
    userRole?: string,
    userEmail?: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ data: AuditLog[]; total: number }> {
    const queryBuilder = this.auditRepository.createQueryBuilder('audit');

    // Apply filters - both bursaryName and userEmail should be applied when provided
    const conditions: string[] = [];
    const params: Record<string, any> = {};

    if (bursaryName) {
      conditions.push('audit.bursaryName = :bursaryName');
      params.bursaryName = bursaryName;
    }

    if (userEmail) {
      conditions.push('audit.userEmail = :userEmail');
      params.userEmail = userEmail;
    }

    // Apply all conditions
    if (conditions.length > 0) {
      queryBuilder.where(conditions.join(' AND '), params);
    }

    // Order by most recent first
    queryBuilder.orderBy('audit.createdAt', 'DESC');

    // Apply pagination
    queryBuilder.skip(offset).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  /**
   * Get activities for a specific student
   */
  async getStudentActivities(
    studentEmail: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ data: AuditLog[]; total: number }> {
    const queryBuilder = this.auditRepository.createQueryBuilder('audit');

    queryBuilder
      .where('audit.studentEmail = :studentEmail', { studentEmail })
      .orderBy('audit.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  /**
   * Get activities by action type
   */
  async getActivitiesByAction(
    action: string,
    bursaryName?: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ data: AuditLog[]; total: number }> {
    const queryBuilder = this.auditRepository.createQueryBuilder('audit');

    queryBuilder.where('audit.action = :action', { action });

    if (bursaryName) {
      queryBuilder.andWhere('audit.bursaryName = :bursaryName', { bursaryName });
    }

    queryBuilder
      .orderBy('audit.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(bursaryName?: string): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    recentActivityCount: number;
    errorCount: number;
  }> {
    const queryBuilder = this.auditRepository.createQueryBuilder('audit');

    if (bursaryName) {
      queryBuilder.where('audit.bursaryName = :bursaryName', { bursaryName });
    }

    const totalActions = await queryBuilder.getCount();

    // Get actions by type
    const actionsByType = await queryBuilder
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.action')
      .getRawMany();

    const actionsByTypeMap = actionsByType.reduce((acc, item) => {
      acc[item.action] = parseInt(item.count);
      return acc;
    }, {});

    // Get recent activity count (last 24 hours)
    const recentActivityCount = await queryBuilder
      .where('audit.createdAt >= :recentDate', {
        recentDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      })
      .getCount();

    // Get error count
    const errorCount = await queryBuilder
      .where('audit.status = :status', { status: 'error' })
      .getCount();

    return {
      totalActions,
      actionsByType: actionsByTypeMap,
      recentActivityCount,
      errorCount,
    };
  }

  /**
   * Force process the queue (useful for testing or shutdown)
   */
  async forceProcessQueue(): Promise<void> {
    await this.processQueue();
  }

  /**
   * Get queue status
   */
  getQueueStatus(): { queueLength: number; isProcessing: boolean } {
    return {
      queueLength: this.auditQueue.length,
      isProcessing: this.isProcessing,
    };
  }
}
