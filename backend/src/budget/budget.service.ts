import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TutorRequest } from '../tutor-requests/tutor-requests.entity';
import { Invoice } from '../invoices/invoices.entity';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(TutorRequest)
    private readonly tutorRequestRepository: Repository<TutorRequest>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async getBudget(bursaryName?: string): Promise<{
    totalBudget: number;
    budgetUsed: number;
    budgetRemaining: number;
    utilizationPercentage: number;
  }> {
    // Calculate total budget from tutor requests
    const budgetQuery = this.tutorRequestRepository
      .createQueryBuilder('request')
      .select([
        'SUM(request.totalAmount) as totalBudget',
        'SUM(CASE WHEN request.paid = true THEN request.totalAmount ELSE 0 END) as budgetUsed',
      ]);

    if (bursaryName) {
      budgetQuery.where('request.bursaryName = :bursaryName', { bursaryName });
    }

    const budgetStats = await budgetQuery.getRawOne();

    const totalBudget = parseFloat(budgetStats?.totalBudget || '0');
    const budgetUsed = parseFloat(budgetStats?.budgetUsed || '0');
    const budgetRemaining = totalBudget - budgetUsed;
    const utilizationPercentage = totalBudget > 0 ? (budgetUsed / totalBudget) * 100 : 0;

    return {
      totalBudget,
      budgetUsed,
      budgetRemaining,
      utilizationPercentage,
    };
  }

  async getBudgetUtilization(bursaryName?: string): Promise<{
    utilizationPercentage: number;
    budgetUsed: number;
    totalBudget: number;
    monthlyUtilization: Array<{
      month: string;
      utilization: number;
      amount: number;
    }>;
  }> {
    const budget = await this.getBudget(bursaryName);

    // Get monthly utilization for the last 12 months
    const monthlyUtilization = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
      
      const monthlyQuery = this.tutorRequestRepository
        .createQueryBuilder('request')
        .select([
          'SUM(CASE WHEN request.paid = true THEN request.totalAmount ELSE 0 END) as amount',
        ])
        .where('request.paid = true')
        .andWhere('request.paidDate >= :startDate', { startDate: monthDate })
        .andWhere('request.paidDate < :endDate', { endDate: nextMonthDate });

      if (bursaryName) {
        monthlyQuery.andWhere('request.bursaryName = :bursaryName', { bursaryName });
      }

      const monthlyStats = await monthlyQuery.getRawOne();
      const amount = parseFloat(monthlyStats?.amount || '0');
      const utilization = budget.totalBudget > 0 ? (amount / budget.totalBudget) * 100 : 0;

      monthlyUtilization.push({
        month: monthDate.toISOString().substring(0, 7), // YYYY-MM format
        utilization,
        amount,
      });
    }

    return {
      utilizationPercentage: budget.utilizationPercentage,
      budgetUsed: budget.budgetUsed,
      totalBudget: budget.totalBudget,
      monthlyUtilization,
    };
  }
}
