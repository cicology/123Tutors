import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BursaryStudentsService } from './bursary-students.service';
import { BursaryStudentsController } from './bursary-students.controller';
import { BursaryStudent } from './bursary-students.entity';
import { AuditModule } from '../audit/audit.module';
import { StudentProgressModule } from '../student-progress/student-progress.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BursaryStudent]),
    AuditModule,
    StudentProgressModule,
  ],
  controllers: [BursaryStudentsController],
  providers: [BursaryStudentsService],
  exports: [BursaryStudentsService],
})
export class BursaryStudentsModule {}
