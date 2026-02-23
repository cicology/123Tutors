import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TutorRequestsService } from './tutor-requests.service';
import { CreateTutorRequestDto } from './dto/create-tutor-request.dto';
import { UpdateTutorRequestDto } from './dto/update-tutor-request.dto';
import { PaginationSearchDto } from '../common/dto/pagination-search.dto';
import { TutorRequest } from './tutor-requests.entity';
import { AuditInterceptor } from '../audit/audit.interceptor';
import { AuditLog } from '../audit/audit.decorator';

@ApiTags('Tutor Requests')
@Controller('tutor-requests')
@UseInterceptors(AuditInterceptor)
export class TutorRequestsController {
  constructor(private readonly tutorRequestsService: TutorRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tutor request' })
  @ApiResponse({ status: 201, description: 'Tutor request created successfully', type: TutorRequest })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @AuditLog({
    action: 'CREATE_TUTOR_REQUEST',
    entityType: 'TutorRequest',
    description: 'Create new tutor request',
  })
  async create(@Body() createTutorRequestDto: CreateTutorRequestDto): Promise<TutorRequest> {
    return await this.tutorRequestsService.create(createTutorRequestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tutor requests with pagination and search' })
  @ApiResponse({ status: 200, description: 'Tutor requests retrieved successfully' })
  async findAll(
    @Query() paginationSearchDto: PaginationSearchDto,
  ): Promise<{ data: TutorRequest[]; total: number }> {
    return await this.tutorRequestsService.findAll(paginationSearchDto, paginationSearchDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get tutor request statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getRequestStats(): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    totalAmount: number;
    paidAmount: number;
  }> {
    return await this.tutorRequestsService.getRequestStats();
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get tutor requests by status (pending, approved, rejected)' })
  @ApiResponse({ status: 200, description: 'Tutor requests retrieved successfully', type: [TutorRequest] })
  async getRequestsByStatus(@Param('status') status: 'pending' | 'approved' | 'rejected'): Promise<TutorRequest[]> {
    return await this.tutorRequestsService.getRequestsByStatus(status);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending tutor requests' })
  @ApiResponse({ status: 200, description: 'Pending tutor requests retrieved successfully', type: [TutorRequest] })
  async findPending(): Promise<TutorRequest[]> {
    return await this.tutorRequestsService.getRequestsByStatus('pending');
  }

  @Get('approved')
  @ApiOperation({ summary: 'Get approved tutor requests' })
  @ApiResponse({ status: 200, description: 'Approved tutor requests retrieved successfully', type: [TutorRequest] })
  async findApproved(): Promise<TutorRequest[]> {
    return await this.tutorRequestsService.getRequestsByStatus('approved');
  }

  @Get('rejected')
  @ApiOperation({ summary: 'Get rejected tutor requests' })
  @ApiResponse({ status: 200, description: 'Rejected tutor requests retrieved successfully', type: [TutorRequest] })
  async findRejected(): Promise<TutorRequest[]> {
    return await this.tutorRequestsService.getRequestsByStatus('rejected');
  }

  @Get('student/:studentEmail')
  @ApiOperation({ summary: 'Get tutor requests by student email' })
  @ApiResponse({ status: 200, description: 'Tutor requests retrieved successfully', type: [TutorRequest] })
  async findByStudentEmail(@Param('studentEmail') studentEmail: string): Promise<TutorRequest[]> {
    return await this.tutorRequestsService.findByStudentEmail(studentEmail);
  }

  @Get('bursary/:bursaryName')
  @ApiOperation({ summary: 'Get tutor requests by bursary name' })
  @ApiResponse({ status: 200, description: 'Tutor requests retrieved successfully', type: [TutorRequest] })
  async findByBursaryName(@Param('bursaryName') bursaryName: string): Promise<TutorRequest[]> {
    return await this.tutorRequestsService.findByBursaryName(bursaryName);
  }

  @Get(':uniqueId')
  @ApiOperation({ summary: 'Get tutor request by unique ID' })
  @ApiResponse({ status: 200, description: 'Tutor request retrieved successfully', type: TutorRequest })
  @ApiResponse({ status: 404, description: 'Tutor request not found' })
  async findOne(@Param('uniqueId') uniqueId: string): Promise<TutorRequest> {
    return await this.tutorRequestsService.findOne(uniqueId);
  }

  @Patch(':uniqueId')
  @ApiOperation({ summary: 'Update tutor request' })
  @ApiResponse({ status: 200, description: 'Tutor request updated successfully', type: TutorRequest })
  @ApiResponse({ status: 404, description: 'Tutor request not found' })
  @AuditLog({
    action: 'UPDATE_TUTOR_REQUEST',
    entityType: 'TutorRequest',
    description: 'Update tutor request',
  })
  async update(
    @Param('uniqueId') uniqueId: string,
    @Body() updateTutorRequestDto: UpdateTutorRequestDto,
  ): Promise<TutorRequest> {
    return await this.tutorRequestsService.update(uniqueId, updateTutorRequestDto);
  }

  @Patch(':uniqueId/approve')
  @ApiOperation({ summary: 'Approve tutor request' })
  @ApiResponse({ status: 200, description: 'Tutor request approved successfully', type: TutorRequest })
  @ApiResponse({ status: 404, description: 'Tutor request not found' })
  @AuditLog({
    action: 'APPROVE_TUTOR_REQUEST',
    entityType: 'TutorRequest',
    description: 'Approve tutor request',
  })
  async approveRequest(@Param('uniqueId') uniqueId: string): Promise<TutorRequest> {
    return await this.tutorRequestsService.approveRequest(uniqueId);
  }

  @Patch(':uniqueId/reject')
  @ApiOperation({ summary: 'Reject tutor request' })
  @ApiResponse({ status: 200, description: 'Tutor request rejected successfully', type: TutorRequest })
  @ApiResponse({ status: 404, description: 'Tutor request not found' })
  @AuditLog({
    action: 'REJECT_TUTOR_REQUEST',
    entityType: 'TutorRequest',
    description: 'Reject tutor request',
  })
  async rejectRequest(
    @Param('uniqueId') uniqueId: string,
    @Body() body: { reason?: string } = {},
  ): Promise<TutorRequest> {
    return await this.tutorRequestsService.rejectRequest(uniqueId, body?.reason);
  }

  @Delete(':uniqueId')
  @ApiOperation({ summary: 'Delete tutor request' })
  @ApiResponse({ status: 200, description: 'Tutor request deleted successfully' })
  @ApiResponse({ status: 404, description: 'Tutor request not found' })
  @AuditLog({
    action: 'DELETE_TUTOR_REQUEST',
    entityType: 'TutorRequest',
    description: 'Delete tutor request',
  })
  async remove(@Param('uniqueId') uniqueId: string): Promise<{ message: string }> {
    await this.tutorRequestsService.remove(uniqueId);
    return { message: 'Tutor request deleted successfully' };
  }
}
