import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboardStats(@CurrentUser() tutor: any) {
    return this.analyticsService.getDashboardStats(tutor.id);
  }

  @Get('monthly')
  getMonthly(
    @CurrentUser() tutor: any,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.analyticsService.getMonthlyAnalytics(
      tutor.id,
      parseInt(year),
      parseInt(month),
    );
  }
}

