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
import { StudentProgressService } from './student-progress.service';
import { CreateStudentProgressDto, UpdateStudentProgressDto } from './dto/create-student-progress.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';
import { StudentProgress } from './student-progress.entity';
import { AuditLog } from '../audit/audit.decorator';
import { AuditInterceptor } from '../audit/audit.interceptor';

@ApiTags('Student Progress')
@Controller('student-progress')
@UseInterceptors(AuditInterceptor)
export class StudentProgressController {
  constructor(private readonly studentProgressService: StudentProgressService) {}

  @Post()
  @AuditLog({ action: 'CREATE_STUDENT_PROGRESS', entityType: 'StudentProgress', description: 'Create student progress record' })
  @ApiOperation({ summary: 'Create a new student progress record' })
  @ApiResponse({ status: 201, description: 'Student progress created successfully', type: StudentProgress })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createStudentProgressDto: CreateStudentProgressDto): Promise<StudentProgress> {
    return await this.studentProgressService.create(createStudentProgressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all student progress records with pagination and search' })
  @ApiResponse({ status: 200, description: 'Student progress records retrieved successfully' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() searchDto: SearchDto,
  ): Promise<{ data: StudentProgress[]; total: number }> {
    return await this.studentProgressService.findAll(paginationDto, searchDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get student progress statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getProgressStats(): Promise<{
    totalStudents: number;
    activeStudents: number;
    completedStudents: number;
    averageProgress: number;
    averageGPA: number;
  }> {
    return await this.studentProgressService.getProgressStats();
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get student progress by status' })
  @ApiResponse({ status: 200, description: 'Student progress records retrieved successfully', type: [StudentProgress] })
  async findByStatus(@Param('status') status: string): Promise<StudentProgress[]> {
    return await this.studentProgressService.findByStatus(status);
  }

  @Get('student/:studentEmail')
  @ApiOperation({ summary: 'Get student progress by student email' })
  @ApiResponse({ status: 200, description: 'Student progress records retrieved successfully', type: [StudentProgress] })
  async findByStudentEmail(@Param('studentEmail') studentEmail: string): Promise<StudentProgress[]> {
    return await this.studentProgressService.findByStudentEmail(studentEmail);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get student progress by course ID' })
  @ApiResponse({ status: 200, description: 'Student progress records retrieved successfully', type: [StudentProgress] })
  async findByCourseId(@Param('courseId') courseId: string): Promise<StudentProgress[]> {
    return await this.studentProgressService.findByCourseId(courseId);
  }

  @Get('bursary/:bursaryName')
  @ApiOperation({ summary: 'Get student progress by bursary name' })
  @ApiResponse({ status: 200, description: 'Student progress records retrieved successfully', type: [StudentProgress] })
  async findByBursaryName(@Param('bursaryName') bursaryName: string): Promise<StudentProgress[]> {
    return await this.studentProgressService.findByBursaryName(bursaryName);
  }

  @Get(':uniqueId')
  @ApiOperation({ summary: 'Get student progress by unique ID' })
  @ApiResponse({ status: 200, description: 'Student progress retrieved successfully', type: StudentProgress })
  @ApiResponse({ status: 404, description: 'Student progress not found' })
  async findOne(@Param('uniqueId') uniqueId: string): Promise<StudentProgress> {
    return await this.studentProgressService.findOne(uniqueId);
  }

  @Patch(':uniqueId')
  @AuditLog({ action: 'UPDATE_STUDENT_PROGRESS', entityType: 'StudentProgress', description: 'Update student progress record' })
  @ApiOperation({ summary: 'Update student progress' })
  @ApiResponse({ status: 200, description: 'Student progress updated successfully', type: StudentProgress })
  @ApiResponse({ status: 404, description: 'Student progress not found' })
  async update(
    @Param('uniqueId') uniqueId: string,
    @Body() updateStudentProgressDto: UpdateStudentProgressDto,
  ): Promise<StudentProgress> {
    return await this.studentProgressService.update(uniqueId, updateStudentProgressDto);
  }

  @Patch(':uniqueId/progress')
  @AuditLog({ action: 'UPDATE_STUDENT_PROGRESS_METRICS', entityType: 'StudentProgress', description: 'Update student progress metrics' })
  @ApiOperation({ summary: 'Update student progress metrics' })
  @ApiResponse({ status: 200, description: 'Student progress updated successfully', type: StudentProgress })
  @ApiResponse({ status: 404, description: 'Student progress not found' })
  async updateProgress(
    @Param('uniqueId') uniqueId: string,
    @Body() progressData: {
      overallProgress?: number;
      gpa?: number;
      creditsCompleted?: number;
      attendancePercentage?: number;
      assignmentsPercentage?: number;
      examsPercentage?: number;
      participationPercentage?: number;
    },
  ): Promise<StudentProgress> {
    return await this.studentProgressService.updateProgress(uniqueId, progressData);
  }

  @Delete(':uniqueId')
  @ApiOperation({ summary: 'Delete student progress record' })
  @ApiResponse({ status: 200, description: 'Student progress deleted successfully' })
  @ApiResponse({ status: 404, description: 'Student progress not found' })
  async remove(@Param('uniqueId') uniqueId: string): Promise<{ message: string }> {
    await this.studentProgressService.remove(uniqueId);
    return { message: 'Student progress deleted successfully' };
  }

  @Post('activity')
  @AuditLog({ action: 'UPDATE_PROGRESS_ON_ACTIVITY', entityType: 'StudentProgress', description: 'Update student progress based on activity completion' })
  @ApiOperation({ summary: 'Update student progress based on activity completion' })
  @ApiResponse({ status: 200, description: 'Student progress updated successfully', type: StudentProgress })
  @ApiResponse({ status: 404, description: 'Student progress not found' })
  async updateProgressOnActivity(
    @Body() activityData: {
      studentEmail: string;
      activityType: 'assignment' | 'exam' | 'attendance' | 'participation';
      score?: number;
    },
  ): Promise<StudentProgress | null> {
    return await this.studentProgressService.updateProgressOnActivity(
      activityData.studentEmail,
      activityData.activityType,
      activityData.score,
    );
  }

  @Post('create-or-update')
  @ApiOperation({ summary: 'Create or update student progress record' })
  @ApiResponse({ status: 200, description: 'Student progress created/updated successfully', type: StudentProgress })
  async createOrUpdateProgress(
    @Body() progressData: {
      studentEmail: string;
      studentName: string;
      courseName: string;
      bursaryName: string;
    },
  ): Promise<StudentProgress> {
    return await this.studentProgressService.createOrUpdateProgress(
      progressData.studentEmail,
      progressData.studentName,
      progressData.courseName,
      progressData.bursaryName,
    );
  }
}

