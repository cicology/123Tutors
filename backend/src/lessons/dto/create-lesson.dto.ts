import { IsString, IsNumber, IsDateString, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({ description: 'Lesson title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Lesson description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Course ID' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Course name' })
  @IsOptional()
  @IsString()
  courseName?: string;

  @ApiProperty({ description: 'Lesson duration in minutes' })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiPropertyOptional({ description: 'Students enrolled' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  studentsEnrolled?: number;

  @ApiPropertyOptional({ description: 'Completion rate percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  completionRate?: number;

  @ApiPropertyOptional({ description: 'Lesson status' })
  @IsOptional()
  @IsEnum(['published', 'draft', 'archived'])
  status?: 'published' | 'draft' | 'archived';

  @ApiPropertyOptional({ description: 'Lesson date' })
  @IsOptional()
  @IsDateString()
  lessonDate?: string;

  @ApiPropertyOptional({ description: 'Lesson location' })
  @IsOptional()
  @IsString()
  lessonLocation?: string;

  @ApiPropertyOptional({ description: 'Lesson type' })
  @IsOptional()
  @IsString()
  lessonType?: string;

  @ApiPropertyOptional({ description: 'Instructor name' })
  @IsOptional()
  @IsString()
  instructorName?: string;

  @ApiPropertyOptional({ description: 'Maximum students' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxStudents?: number;

  @ApiPropertyOptional({ description: 'Lesson price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Bursary name' })
  @IsOptional()
  @IsString()
  bursaryName?: string;
}

export class UpdateLessonDto {
  @ApiPropertyOptional({ description: 'Lesson title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Lesson description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Course ID' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Course name' })
  @IsOptional()
  @IsString()
  courseName?: string;

  @ApiPropertyOptional({ description: 'Lesson duration in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number;

  @ApiPropertyOptional({ description: 'Students enrolled' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  studentsEnrolled?: number;

  @ApiPropertyOptional({ description: 'Completion rate percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  completionRate?: number;

  @ApiPropertyOptional({ description: 'Lesson status' })
  @IsOptional()
  @IsEnum(['published', 'draft', 'archived'])
  status?: 'published' | 'draft' | 'archived';

  @ApiPropertyOptional({ description: 'Lesson date' })
  @IsOptional()
  @IsDateString()
  lessonDate?: string;

  @ApiPropertyOptional({ description: 'Lesson location' })
  @IsOptional()
  @IsString()
  lessonLocation?: string;

  @ApiPropertyOptional({ description: 'Lesson type' })
  @IsOptional()
  @IsString()
  lessonType?: string;

  @ApiPropertyOptional({ description: 'Instructor name' })
  @IsOptional()
  @IsString()
  instructorName?: string;

  @ApiPropertyOptional({ description: 'Maximum students' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxStudents?: number;

  @ApiPropertyOptional({ description: 'Lesson price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Bursary name' })
  @IsOptional()
  @IsString()
  bursaryName?: string;
}

