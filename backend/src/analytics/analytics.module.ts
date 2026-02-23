import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { TutorRequest } from '../tutor-requests/tutor-requests.entity';
import { StudentLesson } from '../student-lessons/student-lessons.entity';
import { TutorSessionsOrder } from '../tutor-sessions-orders/tutor-sessions-orders.entity';
import { BursaryStudent } from '../bursary-students/bursary-students.entity';
import { Invoice } from '../invoices/invoices.entity';
import { StudentProgress } from '../student-progress/student-progress.entity';
import { Lesson } from '../lessons/lessons.entity';
import { Course } from '../courses/courses.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TutorRequest,
      StudentLesson,
      TutorSessionsOrder,
      BursaryStudent,
      Invoice,
      StudentProgress,
      Lesson,
      Course,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
