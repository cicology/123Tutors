import { IsString, IsOptional, IsNumber, IsNotEmpty, MinLength, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ description: 'Institute name', minLength: 2, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  instituteName: string;

  @ApiProperty({ description: 'Module code', minLength: 2, maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  moduleCode: string;

  @ApiProperty({ description: 'Module name', minLength: 2, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  moduleName: string;

  @ApiProperty({ description: 'Module description', required: false, maxLength: 500 })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  moduleDescription?: string;

  @ApiProperty({ description: 'Module year', required: false, minimum: 1, maximum: 10 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  moduleYear?: number;

  @ApiProperty({ description: 'Module level', required: false, maxLength: 50 })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  moduleLevel?: string;

  @ApiProperty({ description: 'Module credits', required: false, minimum: 1, maximum: 200 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(200)
  moduleCredits?: number;

  @ApiProperty({ description: 'Module instructor', required: false, maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  moduleInstructor?: string;

  @ApiProperty({ description: 'Module budget', required: false, minimum: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  moduleBudget?: number;

  @ApiProperty({ description: 'Bursary name', required: false, maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  bursaryName?: string;
}