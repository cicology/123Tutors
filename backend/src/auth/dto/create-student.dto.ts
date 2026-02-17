import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ 
    description: 'Student email address (must be unique)',
    example: 'student@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    description: 'Password (minimum 6 characters)',
    example: 'SecurePassword123!',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ 
    description: 'First name',
    example: 'Jane'
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ 
    description: 'Last name',
    example: 'Student'
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ 
    description: 'Phone number',
    example: '+27123456789',
    required: false
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ 
    description: 'Location/City',
    example: 'Cape Town',
    required: false
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ 
    description: 'Education level',
    example: 'Grade 12',
    required: false
  })
  @IsString()
  @IsOptional()
  level?: string;

  @ApiProperty({ 
    description: 'Subject of interest',
    example: 'Mathematics',
    required: false
  })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ 
    description: 'Learning goals',
    example: 'Improve mathematics skills for university entrance',
    required: false
  })
  @IsString()
  @IsOptional()
  learningGoals?: string;

  @ApiProperty({ 
    description: 'Has bursary',
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  hasBursary?: boolean;

  @ApiProperty({ 
    description: 'Bursary provider name',
    example: 'NSFAS',
    required: false
  })
  @IsString()
  @IsOptional()
  bursaryProvider?: string;

  @ApiProperty({ 
    description: 'Bursary contact information',
    example: 'bursary@nsfas.org.za',
    required: false
  })
  @IsString()
  @IsOptional()
  bursaryContact?: string;
}

