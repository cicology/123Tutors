import { IsString, IsOptional, IsEmail, IsBoolean, IsNumber, IsDecimal } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTutorRequestDto {
  // Student Information
  @ApiProperty({ description: 'Student email address' })
  @IsEmail()
  studentEmail: string;

  @ApiProperty({ description: 'Student first name' })
  @IsString()
  studentFirstName: string;

  @ApiProperty({ description: 'Student last name' })
  @IsString()
  studentLastName: string;

  @ApiPropertyOptional({ description: 'Student gender' })
  @IsOptional()
  @IsString()
  studentGender?: string;

  @ApiPropertyOptional({ description: 'Student phone/WhatsApp' })
  @IsOptional()
  @IsString()
  studentPhoneWhatsapp?: string;

  // Bursary Information
  @ApiPropertyOptional({ description: 'Bursary name' })
  @IsOptional()
  @IsString()
  bursaryName?: string;

  @ApiPropertyOptional({ description: 'Bursary email' })
  @IsOptional()
  @IsEmail()
  bursaryEmail?: string;

  @ApiPropertyOptional({ description: 'Bursary phone' })
  @IsOptional()
  @IsString()
  bursaryPhone?: string;

  // Institute Information
  @ApiPropertyOptional({ description: 'Institute name' })
  @IsOptional()
  @IsString()
  instituteName?: string;

  @ApiPropertyOptional({ description: 'Institute programme' })
  @IsOptional()
  @IsString()
  instituteProgramme?: string;

  @ApiPropertyOptional({ description: 'Institute specialization' })
  @IsOptional()
  @IsString()
  instituteSpecialization?: string;

  @ApiPropertyOptional({ description: 'Student year of study' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  instituteStudentYearOfStudy?: number;

  // School Information
  @ApiPropertyOptional({ description: 'School name' })
  @IsOptional()
  @IsString()
  schoolName?: string;

  @ApiPropertyOptional({ description: 'School grade' })
  @IsOptional()
  @IsString()
  schoolGrade?: string;

  @ApiPropertyOptional({ description: 'School syllabus' })
  @IsOptional()
  @IsString()
  schoolSyllabus?: string;

  @ApiPropertyOptional({ description: 'School type' })
  @IsOptional()
  @IsString()
  schoolType?: string;

  // Tutoring Information
  @ApiPropertyOptional({ description: 'Learning type' })
  @IsOptional()
  @IsString()
  learningType?: string;

  @ApiPropertyOptional({ description: 'Tutoring type' })
  @IsOptional()
  @IsString()
  tutoringType?: string;

  @ApiPropertyOptional({ description: 'Tutoring start period' })
  @IsOptional()
  @IsString()
  tutoringStartPeriod?: string;

  @ApiPropertyOptional({ description: 'Extra tutoring requirements' })
  @IsOptional()
  @IsString()
  extraTutoringRequirements?: string;

  // Course Information
  @ApiPropertyOptional({ description: 'Requested courses' })
  @IsOptional()
  @IsString()
  requestCourses?: string;

  @ApiPropertyOptional({ description: 'Number of courses allocated' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  coursesAllocatedNumber?: number;

  // Financial Information
  @ApiPropertyOptional({ description: 'Total amount' })
  @IsOptional()
  @IsDecimal()
  @Type(() => Number)
  totalAmount?: number;

  @ApiPropertyOptional({ description: 'Platform fee' })
  @IsOptional()
  @IsDecimal()
  @Type(() => Number)
  platformFee?: number;

  @ApiPropertyOptional({ description: 'Hourly rate list text' })
  @IsOptional()
  @IsString()
  hourlyRateListText?: string;

  @ApiPropertyOptional({ description: 'Hours list text' })
  @IsOptional()
  @IsString()
  hoursListText?: string;

  // Payment Information
  @ApiPropertyOptional({ description: 'Payment status' })
  @IsOptional()
  @IsBoolean()
  paid?: boolean;

  @ApiPropertyOptional({ description: 'Installment payment' })
  @IsOptional()
  @IsBoolean()
  installmentPayment?: boolean;

  @ApiPropertyOptional({ description: 'Responsible for payment' })
  @IsOptional()
  @IsString()
  responsibleForPayment?: string;

  // Promo Code Information
  @ApiPropertyOptional({ description: 'Promo code' })
  @IsOptional()
  @IsString()
  promoCode?: string;

  @ApiPropertyOptional({ description: 'Promo code discount' })
  @IsOptional()
  @IsDecimal()
  @Type(() => Number)
  promoCodeDiscount?: number;

  @ApiPropertyOptional({ description: 'Promo code valid' })
  @IsOptional()
  @IsBoolean()
  promoCodeValid?: boolean;

  // Address Information
  @ApiPropertyOptional({ description: 'Address city' })
  @IsOptional()
  @IsString()
  addressCity?: string;

  @ApiPropertyOptional({ description: 'Address province' })
  @IsOptional()
  @IsString()
  addressProvince?: string;

  @ApiPropertyOptional({ description: 'Address country' })
  @IsOptional()
  @IsString()
  addressCountry?: string;

  @ApiPropertyOptional({ description: 'Full address' })
  @IsOptional()
  @IsString()
  addressFull?: string;

  @ApiPropertyOptional({ description: 'Street address' })
  @IsOptional()
  @IsString()
  streetAddress?: string;

  // Contact Information
  @ApiPropertyOptional({ description: 'Recipient email' })
  @IsOptional()
  @IsEmail()
  recipientEmail?: string;

  @ApiPropertyOptional({ description: 'Recipient first name' })
  @IsOptional()
  @IsString()
  recipientFirstName?: string;

  @ApiPropertyOptional({ description: 'Recipient last name' })
  @IsOptional()
  @IsString()
  recipientLastName?: string;

  @ApiPropertyOptional({ description: 'Recipient phone/WhatsApp' })
  @IsOptional()
  @IsString()
  recipientPhoneWhatsapp?: string;

  // Language Information
  @ApiPropertyOptional({ description: 'Main language' })
  @IsOptional()
  @IsString()
  language1Main?: string;

  @ApiPropertyOptional({ description: 'Other language' })
  @IsOptional()
  @IsString()
  language2Other?: string;

  // User Information
  @ApiPropertyOptional({ description: 'User ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'User type' })
  @IsOptional()
  @IsString()
  userType?: string;

  // Audit Information
  @ApiPropertyOptional({ description: 'Unique ID for the request' })
  @IsOptional()
  @IsString()
  uniqueId?: string;

  @ApiPropertyOptional({ description: 'Creator identifier' })
  @IsOptional()
  @IsString()
  creator?: string;

  @ApiPropertyOptional({ description: 'Unique identifier slug' })
  @IsOptional()
  @IsString()
  slug?: string;
}
