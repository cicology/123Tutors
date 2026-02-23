import { IsString, IsNumber, IsDateString, IsOptional, IsEnum, IsEmail, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentProgressDto {
  @ApiProperty({ description: 'Student email' })
  @IsEmail()
  studentEmail: string;

  @ApiProperty({ description: 'Student name' })
  @IsString()
  studentName: string;

  @ApiPropertyOptional({ description: 'Bursary student ID' })
  @IsOptional()
  @IsString()
  bursaryStudentId?: string;

  @ApiPropertyOptional({ description: 'Course ID' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Course name' })
  @IsOptional()
  @IsString()
  courseName?: string;

  @ApiPropertyOptional({ description: 'Overall progress percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  overallProgress?: number;

  @ApiPropertyOptional({ description: 'GPA' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  gpa?: number;

  @ApiPropertyOptional({ description: 'Credits completed' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditsCompleted?: number;

  @ApiPropertyOptional({ description: 'Total credits' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalCredits?: number;

  @ApiPropertyOptional({ description: 'Attendance percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  attendancePercentage?: number;

  @ApiPropertyOptional({ description: 'Assignments percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  assignmentsPercentage?: number;

  @ApiPropertyOptional({ description: 'Exams percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  examsPercentage?: number;

  @ApiPropertyOptional({ description: 'Participation percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  participationPercentage?: number;

  @ApiPropertyOptional({ description: 'Student status' })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'completed', 'dropped'])
  status?: 'active' | 'inactive' | 'completed' | 'dropped';

  @ApiProperty({ description: 'Enrollment date' })
  @IsDateString()
  enrollmentDate: string;

  @ApiPropertyOptional({ description: 'Completion date' })
  @IsOptional()
  @IsDateString()
  completionDate?: string;

  @ApiPropertyOptional({ description: 'Bursary name' })
  @IsOptional()
  @IsString()
  bursaryName?: string;

  @ApiPropertyOptional({ description: 'University' })
  @IsOptional()
  @IsString()
  university?: string;

  @ApiPropertyOptional({ description: 'Year of study' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  yearOfStudy?: number;
}

export class UpdateStudentProgressDto {
  @ApiPropertyOptional({ description: 'Student name' })
  @IsOptional()
  @IsString()
  studentName?: string;

  @ApiPropertyOptional({ description: 'Bursary student ID' })
  @IsOptional()
  @IsString()
  bursaryStudentId?: string;

  @ApiPropertyOptional({ description: 'Course ID' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Course name' })
  @IsOptional()
  @IsString()
  courseName?: string;

  @ApiPropertyOptional({ description: 'Overall progress percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  overallProgress?: number;

  @ApiPropertyOptional({ description: 'GPA' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  gpa?: number;

  @ApiPropertyOptional({ description: 'Credits completed' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditsCompleted?: number;

  @ApiPropertyOptional({ description: 'Total credits' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalCredits?: number;

  @ApiPropertyOptional({ description: 'Attendance percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  attendancePercentage?: number;

  @ApiPropertyOptional({ description: 'Assignments percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  assignmentsPercentage?: number;

  @ApiPropertyOptional({ description: 'Exams percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  examsPercentage?: number;

  @ApiPropertyOptional({ description: 'Participation percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  participationPercentage?: number;

  @ApiPropertyOptional({ description: 'Student status' })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'completed', 'dropped'])
  status?: 'active' | 'inactive' | 'completed' | 'dropped';

  @ApiPropertyOptional({ description: 'Enrollment date' })
  @IsOptional()
  @IsDateString()
  enrollmentDate?: string;

  @ApiPropertyOptional({ description: 'Completion date' })
  @IsOptional()
  @IsDateString()
  completionDate?: string;

  @ApiPropertyOptional({ description: 'Bursary name' })
  @IsOptional()
  @IsString()
  bursaryName?: string;

  @ApiPropertyOptional({ description: 'University' })
  @IsOptional()
  @IsString()
  university?: string;

  @ApiPropertyOptional({ description: 'Year of study' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  yearOfStudy?: number;
}
