import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentProgressController } from './student-progress.controller';
import { StudentProgressService } from './student-progress.service';
import { StudentProgress } from './student-progress.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudentProgress]),
    AuditModule,
  ],
  controllers: [StudentProgressController],
  providers: [StudentProgressService],
  exports: [StudentProgressService],
})
export class StudentProgressModule {}

