import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TutorJobNotificationsService } from './tutor-job-notifications.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';
import { TutorJobNotification } from './tutor-job-notifications.entity';

@ApiTags('TutorJobNotification')
@Controller('tutor-job-notifications')
export class TutorJobNotificationsController {
  constructor(private readonly tutorJobNotificationsService: TutorJobNotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tutor-job-notifications with pagination and search' })
  @ApiResponse({ status: 200, description: 'tutor-job-notifications retrieved successfully' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() searchDto: SearchDto,
  ): Promise<{ data: TutorJobNotification[]; total: number }> {
    return await this.tutorJobNotificationsService.findAll(paginationDto, searchDto);
  }

  @Get(':uniqueId')
  @ApiOperation({ summary: 'Get tutor-job-notifications by unique ID' })
  @ApiResponse({ status: 200, description: 'tutor-job-notifications retrieved successfully', type: TutorJobNotification })
  @ApiResponse({ status: 404, description: 'tutor-job-notifications not found' })
  async findOne(@Param('uniqueId') uniqueId: string): Promise<TutorJobNotification> {
    return await this.tutorJobNotificationsService.findOne(uniqueId);
  }

  @Post('match/:requestUniqueId')
  @ApiOperation({ summary: 'Run smart matching for a tutor request and create a notification entry' })
  @ApiResponse({ status: 201, description: 'Matching completed successfully', type: TutorJobNotification })
  async matchRequest(@Param('requestUniqueId') requestUniqueId: string): Promise<TutorJobNotification> {
    return await this.tutorJobNotificationsService.createMatchesForRequestId(requestUniqueId);
  }
}
