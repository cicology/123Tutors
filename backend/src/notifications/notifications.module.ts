import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { TutorRequest } from '../tutor-requests/tutor-requests.entity';
import { Invoice } from '../invoices/invoices.entity';
import { TutorSessionsOrder } from '../tutor-sessions-orders/tutor-sessions-orders.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TutorRequest, Invoice, TutorSessionsOrder]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}

