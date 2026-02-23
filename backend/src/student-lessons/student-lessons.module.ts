import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentLessonsService } from './student-lessons.service';
import { StudentLessonsController } from './student-lessons.controller';
import { StudentLesson } from './student-lessons.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentLesson])],
  controllers: [StudentLessonsController],
  providers: [StudentLessonsService],
  exports: [StudentLessonsService],
})
export class StudentLessonsModule {}