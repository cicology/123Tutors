import { IsString, IsOptional, IsNumber, IsNotEmpty, IsEmail, IsDateString, MinLength, MaxLength, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BulkUploadStudentDto {
  @ApiProperty({ description: 'Bursary name', minLength: 2, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  bursary: string;

  @ApiProperty({ description: 'Student email' })
  @IsEmail()
  @IsNotEmpty()
  studentEmail: string;

  @ApiProperty({ description: 'Student name and surname', minLength: 2, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  studentNameAndSurname: string;

  @ApiPropertyOptional({ description: 'Year of study', minimum: 1, maximum: 10 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  year?: number;

  @ApiPropertyOptional({ description: 'University name', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  university?: string;

  @ApiPropertyOptional({ description: 'Course name', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  course?: string;

  @ApiPropertyOptional({ description: 'Student ID number', maxLength: 20 })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  studentIdNumber?: string;

  @ApiPropertyOptional({ description: 'Phone number', maxLength: 20 })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Address', maxLength: 200 })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ description: 'Enrollment date' })
  @IsDateString()
  @IsOptional()
  enrollmentDate?: string;

  @ApiPropertyOptional({ description: 'Status', maxLength: 20 })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  status?: string;
}

export class BulkUploadResponseDto {
  @ApiProperty({ description: 'Total number of records processed' })
  totalProcessed: number;

  @ApiProperty({ description: 'Number of successful uploads' })
  successful: number;

  @ApiProperty({ description: 'Number of failed uploads' })
  failed: number;

  @ApiProperty({ description: 'Array of errors encountered' })
  errors: Array<{
    row: number;
    email: string;
    error: string;
  }>;

  @ApiProperty({ description: 'Array of successfully created students' })
  createdStudents: BulkUploadStudentDto[];
}

export class BulkUploadRequestDto {
  @ApiProperty({ description: 'Array of students to upload', type: [BulkUploadStudentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUploadStudentDto)
  students: BulkUploadStudentDto[];
}



















