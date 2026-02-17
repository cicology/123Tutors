import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Analytics } from './entities/analytics.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Review } from '../reviews/entities/review.entity';
import { CourseRequest } from '../requests/entities/course-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Analytics, Lesson, Payment, Review, CourseRequest])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

