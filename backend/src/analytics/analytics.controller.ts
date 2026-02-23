import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiQuery({ name: 'bursaryName', required: false, description: 'Filter by bursary name' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved successfully' })
  async getDashboardStats(@Query('bursaryName') bursaryName?: string) {
    return await this.analyticsService.getDashboardStats(bursaryName);
  }

  @Get('student/:studentEmail')
  @ApiOperation({ summary: 'Get student analytics' })
  @ApiResponse({ status: 200, description: 'Student analytics retrieved successfully' })
  async getStudentAnalytics(@Query('studentEmail') studentEmail: string) {
    return await this.analyticsService.getStudentAnalytics(studentEmail);
  }

  @Get('bursary/:bursaryName')
  @ApiOperation({ summary: 'Get bursary analytics' })
  @ApiResponse({ status: 200, description: 'Bursary analytics retrieved successfully' })
  async getBursaryAnalytics(@Query('bursaryName') bursaryName: string) {
    return await this.analyticsService.getBursaryAnalytics(bursaryName);
  }

  @Get('comprehensive-dashboard')
  @ApiOperation({ summary: 'Get comprehensive dashboard statistics' })
  @ApiQuery({ name: 'bursaryName', required: false, description: 'Filter by bursary name' })
  @ApiResponse({ status: 200, description: 'Comprehensive dashboard statistics retrieved successfully' })
  async getComprehensiveDashboardStats(@Query('bursaryName') bursaryName?: string) {
    return await this.analyticsService.getComprehensiveDashboardStats(bursaryName);
  }

  @Get('course')
  @ApiOperation({ summary: 'Get course analytics' })
  @ApiQuery({ name: 'courseId', required: true, description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Course analytics retrieved successfully' })
  async getCourseAnalytics(@Query('courseId') courseId: string) {
    return await this.analyticsService.getCourseAnalytics(courseId);
  }

  @Get('student-progress')
  @ApiOperation({ summary: 'Get student progress analytics' })
  @ApiQuery({ name: 'studentEmail', required: true, description: 'Student email' })
  @ApiResponse({ status: 200, description: 'Student progress analytics retrieved successfully' })
  async getStudentProgressAnalytics(@Query('studentEmail') studentEmail: string) {
    return await this.analyticsService.getStudentProgressAnalytics(studentEmail);
  }

  @Get('monthly-stats')
  @ApiOperation({ summary: 'Get monthly statistics' })
  @ApiQuery({ name: 'bursaryName', required: false, description: 'Filter by bursary name' })
  @ApiResponse({ status: 200, description: 'Monthly statistics retrieved successfully' })
  async getMonthlyStats(@Query('bursaryName') bursaryName?: string) {
    return await this.analyticsService.getMonthlyStats(bursaryName);
  }

  @Get('monthly-trends')
  @ApiOperation({ summary: 'Get monthly trends' })
  @ApiQuery({ name: 'bursaryName', required: false, description: 'Filter by bursary name' })
  @ApiResponse({ status: 200, description: 'Monthly trends retrieved successfully' })
  async getMonthlyTrends(@Query('bursaryName') bursaryName?: string) {
    return await this.analyticsService.getMonthlyTrends(bursaryName);
  }

  @Get('monthly-enrollment')
  @ApiOperation({ summary: 'Get monthly enrollment data' })
  @ApiQuery({ name: 'bursaryName', required: false, description: 'Filter by bursary name' })
  @ApiResponse({ status: 200, description: 'Monthly enrollment data retrieved successfully' })
  async getMonthlyEnrollmentData(@Query('bursaryName') bursaryName?: string) {
    return await this.analyticsService.getMonthlyEnrollmentData(bursaryName);
  }
}
