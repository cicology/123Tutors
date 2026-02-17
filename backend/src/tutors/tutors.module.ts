import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutorsService } from './tutors.service';
import { TutorsController } from './tutors.controller';
import { Tutor } from './entities/tutor.entity';
import { TutorApplication } from './entities/tutor-application.entity';
import { CourseRequest } from '../requests/entities/course-request.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Chat } from '../chats/entities/chat.entity';
import { Message } from '../chats/entities/message.entity';
import { Student } from '../auth/entities/student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Tutor,
    TutorApplication,
    CourseRequest,
    Lesson,
    Payment,
    Chat,
    Message,
    Student,
  ])],
  controllers: [TutorsController],
  providers: [TutorsService],
  exports: [TutorsService],
})
export class TutorsModule {}

