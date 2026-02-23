import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchDto {
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
