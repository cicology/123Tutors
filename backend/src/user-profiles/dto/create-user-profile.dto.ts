import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserType {
  ADMIN = 'admin',
  USER = 'user',
  TUTOR = 'tutor',
  BURSARY_ADMIN = 'bursary_admin',
  NONE = 'none',
}

export class CreateUserProfileDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User type', enum: UserType })
  @IsEnum(UserType)
  userType: UserType;

  @ApiPropertyOptional({ description: 'Bursary name for bursary admin users' })
  @IsOptional()
  @IsString()
  bursaryName?: string;

  @ApiPropertyOptional({ description: 'Unique identifier slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Creator identifier' })
  @IsOptional()
  @IsString()
  creator?: string;

  @ApiProperty({ description: 'Unique ID for the user' })
  @IsString()
  uniqueId: string;

  @ApiPropertyOptional({ description: 'Profile image URL' })
  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @ApiPropertyOptional({ description: 'Logo URL for user profile' })
  @IsOptional()
  @IsString()
  logoUrl?: string;
}
