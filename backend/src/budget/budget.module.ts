import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';
import { TutorRequest } from '../tutor-requests/tutor-requests.entity';
import { Invoice } from '../invoices/invoices.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TutorRequest, Invoice])],
  controllers: [BudgetController],
  providers: [BudgetService],
  exports: [BudgetService],
})
export class BudgetModule {}

