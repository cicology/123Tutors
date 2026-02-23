import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TutorStudentHoursService } from './tutor-student-hours.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';
import { TutorStudentHour } from './tutor-student-hours.entity';

@ApiTags('TutorStudentHour')
@Controller('tutor-student-hours')
export class TutorStudentHoursController {
  constructor(private readonly tutorStudentHoursService: TutorStudentHoursService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tutor-student-hours with pagination and search' })
  @ApiResponse({ status: 200, description: 'tutor-student-hours retrieved successfully' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() searchDto: SearchDto,
  ): Promise<{ data: TutorStudentHour[]; total: number }> {
    return await this.tutorStudentHoursService.findAll(paginationDto, searchDto);
  }

  @Get(':uniqueId')
  @ApiOperation({ summary: 'Get tutor-student-hours by unique ID' })
  @ApiResponse({ status: 200, description: 'tutor-student-hours retrieved successfully', type: TutorStudentHour })
  @ApiResponse({ status: 404, description: 'tutor-student-hours not found' })
  async findOne(@Param('uniqueId') uniqueId: string): Promise<TutorStudentHour> {
    return await this.tutorStudentHoursService.findOne(uniqueId);
  }
}