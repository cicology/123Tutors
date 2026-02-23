import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsEnum,
  IsEmail,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInvoiceDto {
  @ApiPropertyOptional({ description: 'Unique ID. Auto-generated if omitted', maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  uniqueId?: string;

  @ApiProperty({ description: 'Invoice number', minLength: 2, maxLength: 50 })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  invoiceNumber: string;

  @ApiProperty({ description: 'Student email' })
  @IsEmail()
  studentEmail: string;

  @ApiProperty({ description: 'Student name', minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  studentName: string;

  @ApiPropertyOptional({ description: 'Bursary student ID', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  bursaryStudentId?: string;

  @ApiPropertyOptional({ description: 'Course ID', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  courseId?: string;

  @ApiPropertyOptional({ description: 'Course name', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  courseName?: string;

  @ApiPropertyOptional({ description: 'Linked tutor request ID', maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  requestUniqueId?: string;

  @ApiProperty({ description: 'Invoice amount', minimum: 0, maximum: 1000000 })
  @IsNumber()
  @Min(0)
  @Max(1000000)
  amount: number;

  @ApiPropertyOptional({ description: 'Due date. Defaults to 7 days from issue date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Issue date. Defaults to today' })
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @ApiPropertyOptional({ description: 'Invoice status' })
  @IsOptional()
  @IsEnum(['paid', 'pending', 'overdue', 'cancelled'])
  status?: 'paid' | 'pending' | 'overdue' | 'cancelled';

  @ApiPropertyOptional({ description: 'Payment method', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Notes', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ description: 'Bursary name', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bursaryName?: string;

  @ApiPropertyOptional({ description: 'Automatically generate PDF and email if SMTP is configured' })
  @IsOptional()
  @IsBoolean()
  autoSendEmail?: boolean;
}

export class UpdateInvoiceDto {
  @ApiPropertyOptional({ description: 'Student email' })
  @IsOptional()
  @IsEmail()
  studentEmail?: string;

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

  @ApiPropertyOptional({ description: 'Linked tutor request ID' })
  @IsOptional()
  @IsString()
  requestUniqueId?: string;

  @ApiPropertyOptional({ description: 'Invoice amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Issue date' })
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @ApiPropertyOptional({ description: 'Invoice status' })
  @IsOptional()
  @IsEnum(['paid', 'pending', 'overdue', 'cancelled'])
  status?: 'paid' | 'pending' | 'overdue' | 'cancelled';

  @ApiPropertyOptional({ description: 'Payment method' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Payment date' })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Bursary name' })
  @IsOptional()
  @IsString()
  bursaryName?: string;
}
