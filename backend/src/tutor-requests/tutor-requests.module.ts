import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutorRequestsService } from './tutor-requests.service';
import { TutorRequestsController } from './tutor-requests.controller';
import { TutorRequest } from './tutor-requests.entity';
import { BursaryStudent } from '../bursary-students/bursary-students.entity';
import { AuditModule } from '../audit/audit.module';
import { TutorJobNotificationsModule } from '../tutor-job-notifications/tutor-job-notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TutorRequest, BursaryStudent]),
    AuditModule,
    TutorJobNotificationsModule,
  ],
  controllers: [TutorRequestsController],
  providers: [TutorRequestsService],
  exports: [TutorRequestsService],
})
export class TutorRequestsModule {}
