import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutorStudentHoursService } from './tutor-student-hours.service';
import { TutorStudentHoursController } from './tutor-student-hours.controller';
import { TutorStudentHour } from './tutor-student-hours.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TutorStudentHour])],
  controllers: [TutorStudentHoursController],
  providers: [TutorStudentHoursService],
  exports: [TutorStudentHoursService],
})
export class TutorStudentHoursModule {}