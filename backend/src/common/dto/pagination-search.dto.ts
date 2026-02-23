import { IsOptional, IsPositive, Min, Max, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationSearchDto {
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

  @ApiPropertyOptional({ 
    description: 'Search term for filtering results',
    example: 'john'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    description: 'Sort field',
    example: 'creationDate'
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ 
    description: 'Sort order', 
    enum: ['ASC', 'DESC'],
    example: 'DESC'
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

