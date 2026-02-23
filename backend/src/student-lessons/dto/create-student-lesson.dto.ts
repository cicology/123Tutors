import { IsString, IsOptional, IsNumber, IsNotEmpty, IsEmail, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentLessonDto {
  @ApiProperty({ description: 'Student email' })
  @IsEmail()
  @IsNotEmpty()
  studentEmail: string;

  @ApiProperty({ description: 'Student name' })
  @IsString()
  @IsNotEmpty()
  studentName: string;

  @ApiProperty({ description: 'Lesson title' })
  @IsString()
  @IsNotEmpty()
  lessonTitle: string;

  @ApiProperty({ description: 'Lesson description', required: false })
  @IsString()
  @IsOptional()
  lessonDescription?: string;

  @ApiProperty({ description: 'Course name', required: false })
  @IsString()
  @IsOptional()
  courseName?: string;

  @ApiProperty({ description: 'Tutor name', required: false })
  @IsString()
  @IsOptional()
  tutorName?: string;

  @ApiProperty({ description: 'Tutor email', required: false })
  @IsEmail()
  @IsOptional()
  tutorEmail?: string;

  @ApiProperty({ description: 'Lesson date', required: false })
  @IsDateString()
  @IsOptional()
  lessonDate?: string;

  @ApiProperty({ description: 'Lesson duration in minutes', required: false })
  @IsNumber()
  @IsOptional()
  lessonDuration?: number;

  @ApiProperty({ description: 'Lesson status', required: false })
  @IsString()
  @IsOptional()
  lessonStatus?: string;

  @ApiProperty({ description: 'Admin feedback', required: false })
  @IsString()
  @IsOptional()
  adminFeedback?: string;

  @ApiProperty({ description: 'Student feedback', required: false })
  @IsString()
  @IsOptional()
  studentFeedback?: string;

  @ApiProperty({ description: 'Is completed', required: false })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @ApiProperty({ description: 'Grade', required: false })
  @IsNumber()
  @IsOptional()
  grade?: number;

  @ApiProperty({ description: 'Bursary name', required: false })
  @IsString()
  @IsOptional()
  bursaryName?: string;
}

