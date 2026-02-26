import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TertiaryNamesService } from './tertiary-names.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';
import { TertiaryName } from './tertiary-names.entity';
import { Public } from '../auth/public.decorator';

@ApiTags('Tertiary Names')
@Public()
@Controller('tertiary-names')
export class TertiaryNamesController {
  constructor(private readonly tertiaryNamesService: TertiaryNamesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tertiary institutions with pagination and search' })
  @ApiResponse({ status: 200, description: 'Tertiary institutions retrieved successfully' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() searchDto: SearchDto,
  ): Promise<{ data: TertiaryName[]; total: number }> {
    return await this.tertiaryNamesService.findAll(paginationDto, searchDto);
  }

  @Get(':uniqueId')
  @ApiOperation({ summary: 'Get tertiary institution by unique ID' })
  @ApiResponse({ status: 200, description: 'Tertiary institution retrieved successfully', type: TertiaryName })
  @ApiResponse({ status: 404, description: 'Tertiary institution not found' })
  async findOne(@Param('uniqueId') uniqueId: string): Promise<TertiaryName> {
    return await this.tertiaryNamesService.findOne(uniqueId);
  }
}
