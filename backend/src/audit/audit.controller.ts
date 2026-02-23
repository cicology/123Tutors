import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditLog } from './audit.entity';

@ApiTags('Audit')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('recent-activities')
  @ApiOperation({ summary: 'Get recent activities for a bursary or all activities for admin' })
  @ApiResponse({ status: 200, description: 'Recent activities retrieved successfully' })
  @ApiQuery({ name: 'bursaryName', required: false, description: 'Bursary name to filter by' })
  @ApiQuery({ name: 'userRole', required: false, description: 'User role (admin or regular user)' })
  @ApiQuery({ name: 'userEmail', required: false, description: 'Filter activities by user email' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of records to return', type: Number })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of records to skip', type: Number })
  async getRecentActivities(
    @Query('bursaryName') bursaryName?: string,
    @Query('userRole') userRole?: string,
    @Query('userEmail') userEmail?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{ data: AuditLog[]; total: number }> {
    return await this.auditService.getRecentActivities(
      bursaryName,
      userRole,
      userEmail,
      limit || 50,
      offset || 0,
    );
  }

  @Get('student/:studentEmail')
  @ApiOperation({ summary: 'Get activities for a specific student' })
  @ApiResponse({ status: 200, description: 'Student activities retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of records to return', type: Number })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of records to skip', type: Number })
  async getStudentActivities(
    @Param('studentEmail') studentEmail: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{ data: AuditLog[]; total: number }> {
    return await this.auditService.getStudentActivities(
      studentEmail,
      limit || 20,
      offset || 0,
    );
  }

  @Get('action/:action')
  @ApiOperation({ summary: 'Get activities by action type' })
  @ApiResponse({ status: 200, description: 'Activities retrieved successfully' })
  @ApiQuery({ name: 'bursaryName', required: false, description: 'Bursary name to filter by' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of records to return', type: Number })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of records to skip', type: Number })
  async getActivitiesByAction(
    @Param('action') action: string,
    @Query('bursaryName') bursaryName?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{ data: AuditLog[]; total: number }> {
    return await this.auditService.getActivitiesByAction(
      action,
      bursaryName,
      limit || 20,
      offset || 0,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get audit statistics' })
  @ApiResponse({ status: 200, description: 'Audit statistics retrieved successfully' })
  @ApiQuery({ name: 'bursaryName', required: false, description: 'Bursary name to filter by' })
  async getAuditStats(
    @Query('bursaryName') bursaryName?: string,
  ): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    recentActivityCount: number;
    errorCount: number;
  }> {
    return await this.auditService.getAuditStats(bursaryName);
  }

  @Get('queue-status')
  @ApiOperation({ summary: 'Get audit queue status' })
  @ApiResponse({ status: 200, description: 'Queue status retrieved successfully' })
  async getQueueStatus(): Promise<{ queueLength: number; isProcessing: boolean }> {
    return await this.auditService.getQueueStatus();
  }
}



