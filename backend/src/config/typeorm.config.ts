import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Tutor } from '../tutors/entities/tutor.entity';
import { TutorApplication } from '../tutors/entities/tutor-application.entity';
import { Student } from '../auth/entities/student.entity';
import { Course } from '../courses/entities/course.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Review } from '../reviews/entities/review.entity';
import { Chat } from '../chats/entities/chat.entity';
import { Message } from '../chats/entities/message.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Referral } from '../referrals/entities/referral.entity';
import { Analytics } from '../analytics/entities/analytics.entity';
import { CourseRequest } from '../requests/entities/course-request.entity';
import { Notification } from '../notifications/entities/notification.entity';

export const typeormEntities = [
  Tutor,
  TutorApplication,
  Student,
  Course,
  Lesson,
  Review,
  Chat,
  Message,
  Payment,
  Referral,
  Analytics,
  CourseRequest,
  Notification,
];

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('DB_HOST', 'localhost'),
      port: this.configService.get('DB_PORT', 5432),
      username: this.configService.get('DB_USERNAME', 'postgres'),
      password: this.configService.get('DB_PASSWORD', 'postgres'),
      database: this.configService.get('DB_NAME', 'tutor_dashboard'),
      entities: typeormEntities,
      synchronize: this.configService.get('NODE_ENV') === 'development',
      logging: this.configService.get('NODE_ENV') === 'development',
    };
  }
}

