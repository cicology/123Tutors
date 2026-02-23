import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { TutorRequestsModule } from '../tutor-requests/tutor-requests.module';
import { TutorJobNotificationsModule } from '../tutor-job-notifications/tutor-job-notifications.module';

@Module({
  imports: [TutorRequestsModule, TutorJobNotificationsModule],
  controllers: [AdminController],
})
export class AdminModule {}




