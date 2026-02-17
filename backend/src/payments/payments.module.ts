import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Tutor } from '../tutors/entities/tutor.entity';
import { CourseRequest } from '../requests/entities/course-request.entity';
import { Student } from '../auth/entities/student.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Lesson, Tutor, CourseRequest, Student]),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}

