import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson } from './entities/lesson.entity';
import { CourseRequest } from '../requests/entities/course-request.entity';
import { Course } from '../courses/entities/course.entity';
import { Student } from '../auth/entities/student.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson, CourseRequest, Course, Student]),
    forwardRef(() => NotificationsModule),
    forwardRef(() => PaymentsModule),
  ],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}

