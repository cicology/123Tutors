import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TutorSessionsOrdersService } from './tutor-sessions-orders.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';
import { TutorSessionsOrder } from './tutor-sessions-orders.entity';

@ApiTags('TutorSessionsOrder')
@Controller('tutor-sessions-orders')
export class TutorSessionsOrdersController {
  constructor(private readonly tutorSessionsOrdersService: TutorSessionsOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tutor-sessions-orders with pagination and search' })
  @ApiResponse({ status: 200, description: 'tutor-sessions-orders retrieved successfully' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() searchDto: SearchDto,
  ): Promise<{ data: TutorSessionsOrder[]; total: number }> {
    return await this.tutorSessionsOrdersService.findAll(paginationDto, searchDto);
  }

  @Get(':uniqueId')
  @ApiOperation({ summary: 'Get tutor-sessions-orders by unique ID' })
  @ApiResponse({ status: 200, description: 'tutor-sessions-orders retrieved successfully', type: TutorSessionsOrder })
  @ApiResponse({ status: 404, description: 'tutor-sessions-orders not found' })
  async findOne(@Param('uniqueId') uniqueId: string): Promise<TutorSessionsOrder> {
    return await this.tutorSessionsOrdersService.findOne(uniqueId);
  }
}