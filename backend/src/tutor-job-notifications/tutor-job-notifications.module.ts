import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutorJobNotificationsService } from './tutor-job-notifications.service';
import { TutorJobNotificationsController } from './tutor-job-notifications.controller';
import { TutorJobNotification } from './tutor-job-notifications.entity';
import { TutorRequest } from '../tutor-requests/tutor-requests.entity';
import { UserProfile } from '../user-profiles/user-profiles.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TutorJobNotification, TutorRequest, UserProfile])],
  controllers: [TutorJobNotificationsController],
  providers: [TutorJobNotificationsService],
  exports: [TutorJobNotificationsService],
})
export class TutorJobNotificationsModule {}
