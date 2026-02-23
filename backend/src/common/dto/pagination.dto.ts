import { IsOptional, IsPositive, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ 
    default: 1, 
    minimum: 1,
    description: 'Page number for pagination',
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ 
    default: 10, 
    minimum: 1, 
    maximum: 100,
    description: 'Number of items per page',
    example: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
