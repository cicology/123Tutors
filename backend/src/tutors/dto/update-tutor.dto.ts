import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTutorDto {
  @ApiProperty({ 
    description: 'First name of the tutor',
    example: 'John',
    required: false 
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ 
    description: 'Last name of the tutor',
    example: 'Doe',
    required: false 
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ 
    description: 'Email address of the tutor',
    example: 'john.doe@example.com',
    required: false 
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ 
    description: 'Phone number of the tutor',
    example: '+27123456789',
    required: false 
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ 
    description: 'Location/City of the tutor',
    example: 'Cape Town',
    required: false 
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ 
    description: 'Subjects the tutor teaches (comma-separated)',
    example: 'Mathematics, Physics, Chemistry',
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
    description: 'Profile picture URL/path',
    example: '/uploads/profile-pictures/tutor-123.jpg',
    required: false 
  })
  @IsString()
  @IsOptional()
  profilePicture?: string;
}

