import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BudgetService } from './budget.service';

@ApiTags('Budget')
@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get()
  @ApiOperation({ summary: 'Get budget information' })
  @ApiQuery({ name: 'bursaryName', required: false, description: 'Filter by bursary name' })
  @ApiResponse({ status: 200, description: 'Budget information retrieved successfully' })
  async getBudget(@Query('bursaryName') bursaryName?: string) {
    return await this.budgetService.getBudget(bursaryName);
  }

  @Get('utilization')
  @ApiOperation({ summary: 'Get budget utilization' })
  @ApiQuery({ name: 'bursaryName', required: false, description: 'Filter by bursary name' })
  @ApiResponse({ status: 200, description: 'Budget utilization retrieved successfully' })
  async getBudgetUtilization(@Query('bursaryName') bursaryName?: string) {
    return await this.budgetService.getBudgetUtilization(bursaryName);
  }
}

