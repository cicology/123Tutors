import { IsString, IsOptional, IsNumber, IsNotEmpty, IsEmail, IsDateString, MinLength, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBursaryStudentDto {
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

  @ApiProperty({ description: 'Year of study', required: false, minimum: 1, maximum: 10 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  year?: number;

  @ApiProperty({ description: 'University name', required: false, maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  university?: string;

  @ApiProperty({ description: 'Course name', required: false, maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  course?: string;

  @ApiProperty({ description: 'Student ID number', required: false, maxLength: 20 })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  studentIdNumber?: string;

  @ApiProperty({ description: 'Phone number', required: false, maxLength: 20 })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiProperty({ description: 'Address', required: false, maxLength: 200 })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  address?: string;

  @ApiProperty({ description: 'Enrollment date', required: false })
  @IsDateString()
  @IsOptional()
  enrollmentDate?: string;

  @ApiProperty({ description: 'Status', required: false, maxLength: 20 })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  status?: string;

  @ApiProperty({ description: 'Budget allocated to student', required: false })
  @IsNumber()
  @IsOptional()
  budget?: number;
}
