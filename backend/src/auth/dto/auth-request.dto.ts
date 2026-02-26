import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserType } from '../../user-profiles/dto/create-user-profile.dto';

export class LoginDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Optional user type check', enum: UserType })
  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;
}

export class RegisterDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'User type. Public registration is restricted to user role.', enum: UserType })
  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;

  @ApiProperty({ description: 'Unique ID for the user' })
  @IsString()
  @MinLength(3)
  uniqueId: string;
}

