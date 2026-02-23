import { Module } from '@nestjs/common';
import { InvoicesModule } from '../invoices/invoices.module';
import { TutorRequestsModule } from '../tutor-requests/tutor-requests.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [InvoicesModule, TutorRequestsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}

