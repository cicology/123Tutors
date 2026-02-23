import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TertiaryProgrammesService } from './tertiary-programmes.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';
import { TertiaryProgramme } from './tertiary-programmes.entity';

@ApiTags('Tertiary Programmes')
@Controller('tertiary-programmes')
export class TertiaryProgrammesController {
  constructor(private readonly tertiaryProgrammesService: TertiaryProgrammesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tertiary programmes with pagination and search' })
  @ApiResponse({ status: 200, description: 'Tertiary programmes retrieved successfully' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() searchDto: SearchDto,
  ): Promise<{ data: TertiaryProgramme[]; total: number }> {
    return await this.tertiaryProgrammesService.findAll(paginationDto, searchDto);
  }

  @Get(':uniqueId')
  @ApiOperation({ summary: 'Get tertiary programme by unique ID' })
  @ApiResponse({ status: 200, description: 'Tertiary programme retrieved successfully', type: TertiaryProgramme })
  @ApiResponse({ status: 404, description: 'Tertiary programme not found' })
  async findOne(@Param('uniqueId') uniqueId: string): Promise<TertiaryProgramme> {
    return await this.tertiaryProgrammesService.findOne(uniqueId);
  }
}
