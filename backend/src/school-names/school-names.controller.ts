import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SchoolNamesService } from './school-names.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';
import { SchoolName } from './school-names.entity';
import { Public } from '../auth/public.decorator';

@ApiTags('School Names')
@Public()
@Controller('school-names')
export class SchoolNamesController {
  constructor(private readonly schoolNamesService: SchoolNamesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all school names with pagination and search' })
  @ApiResponse({ status: 200, description: 'School names retrieved successfully' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() searchDto: SearchDto,
  ): Promise<{ data: SchoolName[]; total: number }> {
    return await this.schoolNamesService.findAll(paginationDto, searchDto);
  }

  @Get(':uniqueId')
  @ApiOperation({ summary: 'Get school name by unique ID' })
  @ApiResponse({ status: 200, description: 'School name retrieved successfully', type: SchoolName })
  @ApiResponse({ status: 404, description: 'School name not found' })
  async findOne(@Param('uniqueId') uniqueId: string): Promise<SchoolName> {
    return await this.schoolNamesService.findOne(uniqueId);
  }
}
