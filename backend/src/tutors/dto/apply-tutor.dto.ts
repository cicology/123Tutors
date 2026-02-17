import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyTutorDto {
  @ApiProperty({ 
    description: 'First name of the applicant',
    example: 'John',
    required: false 
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ 
    description: 'Last name of the applicant',
    example: 'Doe',
    required: false 
  })
  @IsString()
  @IsOptional()
  lastName?: string;

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
    description: 'Subjects to teach (comma-separated)',
    example: 'Mathematics, Physics',
    required: false 
  })
  @IsString()
  @IsOptional()
  subjects?: string;

  @ApiProperty({ 
    description: 'Educational qualifications',
    example: 'BSc Mathematics, Teaching Certificate',
    required: false 
  })
  @IsString()
  @IsOptional()
  qualifications?: string;

  @ApiProperty({ 
    description: 'Teaching experience',
    example: '5 years of teaching experience',
    required: false 
  })
  @IsString()
  @IsOptional()
  experience?: string;

  @ApiProperty({ 
    description: 'Referral code (if referred by another tutor)',
    example: 'REF123',
    required: false 
  })
  @IsString()
  @IsOptional()
  referralCode?: string;
}


