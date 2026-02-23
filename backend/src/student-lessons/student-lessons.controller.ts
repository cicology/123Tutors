import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StudentLessonsService } from './student-lessons.service';
import { PaginationSearchDto } from '../common/dto/pagination-search.dto';
import { StudentLesson } from './student-lessons.entity';
import { CreateStudentLessonDto } from './dto/create-student-lesson.dto';
import { UpdateStudentLessonDto } from './dto/update-student-lesson.dto';

@ApiTags('StudentLesson')
@Controller('student-lessons')
export class StudentLessonsController {
  constructor(private readonly studentLessonsService: StudentLessonsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all student-lessons with pagination and search' })
  @ApiResponse({ status: 200, description: 'student-lessons retrieved successfully' })
  async findAll(
    @Query() paginationSearchDto: PaginationSearchDto,
  ): Promise<{ data: StudentLesson[]; total: number }> {
    return await this.studentLessonsService.findAll(paginationSearchDto, paginationSearchDto);
  }

  @Get('published')
  @ApiOperation({ summary: 'Get published student lessons' })
  @ApiResponse({ status: 200, description: 'Published student lessons retrieved successfully', type: [StudentLesson] })
  async findPublished(): Promise<StudentLesson[]> {
    return await this.studentLessonsService.findPublished();
  }

  @Get('draft')
  @ApiOperation({ summary: 'Get draft student lessons' })
  @ApiResponse({ status: 200, description: 'Draft student lessons retrieved successfully', type: [StudentLesson] })
  async findDraft(): Promise<StudentLesson[]> {
    return await this.studentLessonsService.findDraft();
  }

  @Get(':uniqueId')
  @ApiOperation({ summary: 'Get student-lessons by unique ID' })
  @ApiResponse({ status: 200, description: 'student-lessons retrieved successfully', type: StudentLesson })
  @ApiResponse({ status: 404, description: 'student-lessons not found' })
  async findOne(@Param('uniqueId') uniqueId: string): Promise<StudentLesson> {
    return await this.studentLessonsService.findOne(uniqueId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new student lesson' })
  @ApiResponse({ status: 201, description: 'Student lesson created successfully', type: StudentLesson })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createStudentLessonDto: CreateStudentLessonDto): Promise<StudentLesson> {
    return await this.studentLessonsService.create(createStudentLessonDto);
  }

  @Put(':uniqueId')
  @ApiOperation({ summary: 'Update a student lesson' })
  @ApiResponse({ status: 200, description: 'Student lesson updated successfully', type: StudentLesson })
  @ApiResponse({ status: 404, description: 'Student lesson not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async update(
    @Param('uniqueId') uniqueId: string,
    @Body() updateStudentLessonDto: UpdateStudentLessonDto,
  ): Promise<StudentLesson> {
    return await this.studentLessonsService.update(uniqueId, updateStudentLessonDto);
  }

  @Delete(':uniqueId')
  @ApiOperation({ summary: 'Delete a student lesson' })
  @ApiResponse({ status: 200, description: 'Student lesson deleted successfully' })
  @ApiResponse({ status: 404, description: 'Student lesson not found' })
  async remove(@Param('uniqueId') uniqueId: string): Promise<void> {
    return await this.studentLessonsService.remove(uniqueId);
  }
}