import { PartialType } from '@nestjs/swagger';
import { CreateTutorRequestDto } from './create-tutor-request.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { IsDateString } from 'class-validator';

export class UpdateTutorRequestDto extends PartialType(CreateTutorRequestDto) {
  @ApiPropertyOptional({ description: 'List of assigned tutors' })
  @IsOptional()
  @IsString()
  tutorsAssignedList?: string;

  @ApiPropertyOptional({ description: 'Number of tutors notified' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  tutorsNotifiedNum?: number;

  @ApiPropertyOptional({ description: 'Date/time request was paid' })
  @IsOptional()
  @IsDateString()
  paidDate?: string;
}
