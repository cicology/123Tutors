import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { PaginationSearchDto } from '../common/dto/pagination-search.dto';
import { Course } from './courses.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all courses with pagination and search' })
  @ApiResponse({ status: 200, description: 'courses retrieved successfully' })
  async findAll(
    @Query() paginationSearchDto: PaginationSearchDto,
  ): Promise<{ data: Course[]; total: number }> {
    return await this.coursesService.findAll(paginationSearchDto, paginationSearchDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active courses' })
  @ApiResponse({ status: 200, description: 'Active courses retrieved successfully', type: [Course] })
  async findActive(): Promise<Course[]> {
    return await this.coursesService.findActive();
  }

  @Get(':uniqueId')
  @ApiOperation({ summary: 'Get courses by unique ID' })
  @ApiResponse({ status: 200, description: 'courses retrieved successfully', type: Course })
  @ApiResponse({ status: 404, description: 'courses not found' })
  async findOne(@Param('uniqueId') uniqueId: string): Promise<Course> {
    return await this.coursesService.findOne(uniqueId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully', type: Course })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return await this.coursesService.create(createCourseDto);
  }

  @Put(':uniqueId')
  @ApiOperation({ summary: 'Update a course' })
  @ApiResponse({ status: 200, description: 'Course updated successfully', type: Course })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async update(
    @Param('uniqueId') uniqueId: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    return await this.coursesService.update(uniqueId, updateCourseDto);
  }

  @Delete(':uniqueId')
  @ApiOperation({ summary: 'Delete a course' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async remove(@Param('uniqueId') uniqueId: string): Promise<void> {
    return await this.coursesService.remove(uniqueId);
  }
}