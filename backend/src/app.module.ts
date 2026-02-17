import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TutorsModule } from './tutors/tutors.module';
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ChatsModule } from './chats/chats.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PaymentsModule } from './payments/payments.module';
import { ReferralsModule } from './referrals/referrals.module';
import { RequestsModule } from './requests/requests.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TypeOrmConfigService } from './config/typeorm.config';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    AuthModule,
    TutorsModule,
    CoursesModule,
    LessonsModule,
    ReviewsModule,
    ChatsModule,
    AnalyticsModule,
    PaymentsModule,
    ReferralsModule,
    RequestsModule,
    NotificationsModule,
  ],
})
export class AppModule {}

