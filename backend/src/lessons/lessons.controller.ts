import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/create-lesson.dto';
import { PaginationSearchDto } from '../common/dto/pagination-search.dto';
import { Lesson } from './lessons.entity';

@ApiTags('Lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lesson' })
  @ApiResponse({ status: 201, description: 'Lesson created successfully', type: Lesson })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createLessonDto: CreateLessonDto): Promise<Lesson> {
    return await this.lessonsService.create(createLessonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lessons with pagination and search' })
  @ApiResponse({ status: 200, description: 'Lessons retrieved successfully' })
  async findAll(
    @Query() paginationSearchDto: PaginationSearchDto,
  ): Promise<{ data: Lesson[]; total: number }> {
    return await this.lessonsService.findAll(paginationSearchDto, paginationSearchDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get lesson statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getLessonStats(): Promise<{
    totalLessons: number;
    publishedLessons: number;
    draftLessons: number;
    archivedLessons: number;
    totalEnrollments: number;
    averageCompletionRate: number;
  }> {
    return await this.lessonsService.getLessonStats();
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get lessons by status' })
  @ApiResponse({ status: 200, description: 'Lessons retrieved successfully', type: [Lesson] })
  async findByStatus(@Param('status') status: string): Promise<Lesson[]> {
    return await this.lessonsService.findByStatus(status);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get lessons by course ID' })
  @ApiResponse({ status: 200, description: 'Lessons retrieved successfully', type: [Lesson] })
  async findByCourseId(@Param('courseId') courseId: string): Promise<Lesson[]> {
    return await this.lessonsService.findByCourseId(courseId);
  }

  @Get('bursary/:bursaryName')
  @ApiOperation({ summary: 'Get lessons by bursary name' })
  @ApiResponse({ status: 200, description: 'Lessons retrieved successfully', type: [Lesson] })
  async findByBursaryName(@Param('bursaryName') bursaryName: string): Promise<{ data: Lesson[]; total: number }> {
    const lessons = await this.lessonsService.findByBursaryName(bursaryName);
    return { data: lessons, total: lessons.length };
  }

  @Get(':uniqueId')
  @ApiOperation({ summary: 'Get lesson by unique ID' })
  @ApiResponse({ status: 200, description: 'Lesson retrieved successfully', type: Lesson })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async findOne(@Param('uniqueId') uniqueId: string): Promise<Lesson> {
    return await this.lessonsService.findOne(uniqueId);
  }

  @Patch(':uniqueId')
  @ApiOperation({ summary: 'Update lesson' })
  @ApiResponse({ status: 200, description: 'Lesson updated successfully', type: Lesson })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async update(
    @Param('uniqueId') uniqueId: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ): Promise<Lesson> {
    return await this.lessonsService.update(uniqueId, updateLessonDto);
  }

  @Patch(':uniqueId/publish')
  @ApiOperation({ summary: 'Publish lesson' })
  @ApiResponse({ status: 200, description: 'Lesson published successfully', type: Lesson })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async publishLesson(@Param('uniqueId') uniqueId: string): Promise<Lesson> {
    return await this.lessonsService.publishLesson(uniqueId);
  }

  @Patch(':uniqueId/archive')
  @ApiOperation({ summary: 'Archive lesson' })
  @ApiResponse({ status: 200, description: 'Lesson archived successfully', type: Lesson })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async archiveLesson(@Param('uniqueId') uniqueId: string): Promise<Lesson> {
    return await this.lessonsService.archiveLesson(uniqueId);
  }

  @Patch(':uniqueId/enrollment')
  @ApiOperation({ summary: 'Update lesson enrollment count' })
  @ApiResponse({ status: 200, description: 'Enrollment updated successfully', type: Lesson })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async updateEnrollment(
    @Param('uniqueId') uniqueId: string,
    @Body() body: { enrolledCount: number },
  ): Promise<Lesson> {
    return await this.lessonsService.updateEnrollment(uniqueId, body.enrolledCount);
  }

  @Patch(':uniqueId/completion-rate')
  @ApiOperation({ summary: 'Update lesson completion rate' })
  @ApiResponse({ status: 200, description: 'Completion rate updated successfully', type: Lesson })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async updateCompletionRate(
    @Param('uniqueId') uniqueId: string,
    @Body() body: { completionRate: number },
  ): Promise<Lesson> {
    return await this.lessonsService.updateCompletionRate(uniqueId, body.completionRate);
  }

  @Delete(':uniqueId')
  @ApiOperation({ summary: 'Delete lesson' })
  @ApiResponse({ status: 200, description: 'Lesson deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async remove(@Param('uniqueId') uniqueId: string): Promise<{ message: string }> {
    await this.lessonsService.remove(uniqueId);
    return { message: 'Lesson deleted successfully' };
  }
}

