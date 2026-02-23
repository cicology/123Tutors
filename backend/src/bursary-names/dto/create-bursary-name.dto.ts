import { IsString, IsOptional, IsNumber, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBursaryNameDto {
  @ApiProperty({ description: 'Bursary organization name' })
  @IsString()
  bursaryName: string;

  @ApiPropertyOptional({ description: 'Bursary organization address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Unique identifier slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Creator identifier' })
  @IsOptional()
  @IsString()
  creator?: string;

  @ApiProperty({ description: 'Unique ID for the bursary' })
  @IsString()
  uniqueId: string;

  // Extended profile fields
  @ApiPropertyOptional({ description: 'Organization logo URL or base64' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ description: 'Organization description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Organization email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Organization phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Organization website' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ description: 'Total number of students' })
  @IsOptional()
  @IsNumber()
  totalStudents?: number;

  @ApiPropertyOptional({ description: 'Total budget amount', type: 'number', minimum: 0 })
  @IsOptional()
  @IsNumber()
  totalBudget?: number;

  @ApiPropertyOptional({ description: 'Year organization was established' })
  @IsOptional()
  @IsNumber()
  yearEstablished?: number;

  @ApiPropertyOptional({ description: 'Number of programs offered' })
  @IsOptional()
  @IsNumber()
  programsOffered?: number;

  @ApiPropertyOptional({ description: 'Primary brand color' })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional({ description: 'Secondary brand color' })
  @IsOptional()
  @IsString()
  secondaryColor?: string;
}
