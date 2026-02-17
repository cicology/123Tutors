import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { LessonType } from '../entities/lesson.entity';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsOptional()
  courseId?: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsDateString()
  @IsNotEmpty()
  scheduledAt: string;

  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @IsEnum(LessonType)
  @IsOptional()
  type?: LessonType;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  requestId?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  hourlyRate?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  totalAmount?: number;
}

