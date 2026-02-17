import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { CourseRequest } from './entities/course-request.entity';
import { Course } from '../courses/entities/course.entity';
import { Tutor } from '../tutors/entities/tutor.entity';
import { Student } from '../auth/entities/student.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { ReferralsModule } from '../referrals/referrals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseRequest, Course, Tutor, Student]),
    forwardRef(() => NotificationsModule),
    ReferralsModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}


