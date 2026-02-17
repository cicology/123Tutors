import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonDto } from './create-lesson.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { LessonStatus } from '../entities/lesson.entity';

export class UpdateLessonDto extends PartialType(CreateLessonDto) {
  @IsEnum(LessonStatus)
  @IsOptional()
  status?: LessonStatus;
}

