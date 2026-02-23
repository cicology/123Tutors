import { Controller, Get, Post, Put, Delete, Patch, Param, Query, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BursaryStudentsService } from './bursary-students.service';
import { PaginationSearchDto } from '../common/dto/pagination-search.dto';
import { BursaryStudent } from './bursary-students.entity';
import { CreateBursaryStudentDto } from './dto/create-bursary-student.dto';
import { UpdateBursaryStudentDto } from './dto/update-bursary-student.dto';
import { BulkUploadRequestDto, BulkUploadResponseDto } from './dto/bulk-upload.dto';
import { AuditInterceptor } from '../audit/audit.interceptor';
import { AuditLog } from '../audit/audit.decorator';

@ApiTags('Bursary Students')
@Controller('bursary-students')
@UseInterceptors(AuditInterceptor)
export class BursaryStudentsController {
  constructor(private readonly bursaryStudentsService: BursaryStudentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all bursary students with pagination and search' })
  @ApiResponse({ status: 200, description: 'Bursary students retrieved successfully' })
  async findAll(
    @Query() paginationSearchDto: PaginationSearchDto,
  ): Promise<{ data: BursaryStudent[]; total: number }> {
    return await this.bursaryStudentsService.findAll(paginationSearchDto, paginationSearchDto);
  }

  @Get('bursary/:bursary')
  @ApiOperation({ summary: 'Get bursary students by bursary name' })
  @ApiResponse({ status: 200, description: 'Bursary students retrieved successfully', type: [BursaryStudent] })
  async findByBursary(@Param('bursary') bursary: string): Promise<BursaryStudent[]> {
    return await this.bursaryStudentsService.findByBursary(bursary);
  }

  @Get('student/:studentEmail')
  @ApiOperation({ summary: 'Get bursary students by student email' })
  @ApiResponse({ status: 200, description: 'Bursary students retrieved successfully', type: [BursaryStudent] })
  async findByStudentEmail(@Param('studentEmail') studentEmail: string): Promise<BursaryStudent[]> {
    return await this.bursaryStudentsService.findByStudentEmail(studentEmail);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active bursary students' })
  @ApiResponse({ status: 200, description: 'Active bursary students retrieved successfully', type: [BursaryStudent] })
  async findActive(): Promise<BursaryStudent[]> {
    return await this.bursaryStudentsService.findActive();
  }

  @Get('completed')
  @ApiOperation({ summary: 'Get completed bursary students' })
  @ApiResponse({ status: 200, description: 'Completed bursary students retrieved successfully', type: [BursaryStudent] })
  async findCompleted(): Promise<BursaryStudent[]> {
    return await this.bursaryStudentsService.findCompleted();
  }

  @Get(':uniqueId')
  @ApiOperation({ summary: 'Get bursary student by unique ID' })
  @ApiResponse({ status: 200, description: 'Bursary student retrieved successfully', type: BursaryStudent })
  @ApiResponse({ status: 404, description: 'Bursary student not found' })
  async findOne(@Param('uniqueId') uniqueId: string): Promise<BursaryStudent> {
    return await this.bursaryStudentsService.findOne(uniqueId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new bursary student' })
  @ApiResponse({ status: 201, description: 'Bursary student created successfully', type: BursaryStudent })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @AuditLog({
    action: 'CREATE_BURSARY_STUDENT',
    entityType: 'BursaryStudent',
    description: 'Create new bursary student',
  })
  async create(@Body() createBursaryStudentDto: CreateBursaryStudentDto): Promise<BursaryStudent> {
    return await this.bursaryStudentsService.create(createBursaryStudentDto);
  }

  @Post('bulk-upload/file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Bulk upload students from Excel or CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Bulk upload completed', type: BulkUploadResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file format or data' })
  async bulkUploadFromFile(@UploadedFile() file: Express.Multer.File): Promise<BulkUploadResponseDto> {
    return await this.bursaryStudentsService.bulkUploadFromFile(file);
  }

  @Post('bulk-upload/data')
  @ApiOperation({ summary: 'Bulk upload students from JSON data' })
  @ApiResponse({ status: 201, description: 'Bulk upload completed', type: BulkUploadResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async bulkUploadFromData(@Body() bulkUploadRequestDto: BulkUploadRequestDto): Promise<BulkUploadResponseDto> {
    return await this.bursaryStudentsService.bulkUploadFromData(bulkUploadRequestDto.students);
  }

  @Put(':uniqueId')
  @ApiOperation({ summary: 'Update a bursary student' })
  @ApiResponse({ status: 200, description: 'Bursary student updated successfully', type: BursaryStudent })
  @ApiResponse({ status: 404, description: 'Bursary student not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @AuditLog({
    action: 'UPDATE_BURSARY_STUDENT',
    entityType: 'BursaryStudent',
    description: 'Update bursary student',
  })
  async update(
    @Param('uniqueId') uniqueId: string,
    @Body() updateBursaryStudentDto: UpdateBursaryStudentDto,
  ): Promise<BursaryStudent> {
    return await this.bursaryStudentsService.update(uniqueId, updateBursaryStudentDto);
  }

  @Patch(':uniqueId/disable')
  @ApiOperation({ summary: 'Disable a bursary student' })
  @ApiResponse({ status: 200, description: 'Bursary student disabled successfully', type: BursaryStudent })
  @ApiResponse({ status: 404, description: 'Bursary student not found' })
  @AuditLog({
    action: 'DISABLE_BURSARY_STUDENT',
    entityType: 'BursaryStudent',
    description: 'Disable bursary student',
  })
  async disableStudent(@Param('uniqueId') uniqueId: string): Promise<BursaryStudent> {
    return await this.bursaryStudentsService.disableStudent(uniqueId);
  }

  @Patch(':uniqueId/enable')
  @ApiOperation({ summary: 'Enable a bursary student' })
  @ApiResponse({ status: 200, description: 'Bursary student enabled successfully', type: BursaryStudent })
  @ApiResponse({ status: 404, description: 'Bursary student not found' })
  @AuditLog({
    action: 'ENABLE_BURSARY_STUDENT',
    entityType: 'BursaryStudent',
    description: 'Enable bursary student',
  })
  async enableStudent(@Param('uniqueId') uniqueId: string): Promise<BursaryStudent> {
    return await this.bursaryStudentsService.enableStudent(uniqueId);
  }

  @Delete(':uniqueId')
  @ApiOperation({ summary: 'Delete a bursary student' })
  @ApiResponse({ status: 200, description: 'Bursary student deleted successfully' })
  @ApiResponse({ status: 404, description: 'Bursary student not found' })
  @AuditLog({
    action: 'DELETE_BURSARY_STUDENT',
    entityType: 'BursaryStudent',
    description: 'Delete bursary student',
  })
  async remove(@Param('uniqueId') uniqueId: string): Promise<void> {
    return await this.bursaryStudentsService.remove(uniqueId);
  }
}
