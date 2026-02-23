import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TertiarySpecializationsService } from './tertiary-specializations.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';
import { TertiarySpecialization } from './tertiary-specializations.entity';

@ApiTags('TertiarySpecialization')
@Controller('tertiary-specializations')
export class TertiarySpecializationsController {
  constructor(private readonly tertiarySpecializationsService: TertiarySpecializationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tertiary-specializations with pagination and search' })
  @ApiResponse({ status: 200, description: 'tertiary-specializations retrieved successfully' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() searchDto: SearchDto,
  ): Promise<{ data: TertiarySpecialization[]; total: number }> {
    return await this.tertiarySpecializationsService.findAll(paginationDto, searchDto);
  }

  @Get(':uniqueId')
  @ApiOperation({ summary: 'Get tertiary-specializations by unique ID' })
  @ApiResponse({ status: 200, description: 'tertiary-specializations retrieved successfully', type: TertiarySpecialization })
  @ApiResponse({ status: 404, description: 'tertiary-specializations not found' })
  async findOne(@Param('uniqueId') uniqueId: string): Promise<TertiarySpecialization> {
    return await this.tertiarySpecializationsService.findOne(uniqueId);
  }
}