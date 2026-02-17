import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TutorsService } from '../tutors/tutors.service';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly tutorsService: TutorsService,
  ) {}

  @Post()
  create(@CurrentUser() tutor: any, @Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(tutor.id, createCourseDto);
  }

  @Get()
  async findAll(@CurrentUser() user: any, @Query('view') view?: string) {
    // If view=tutor is specified, always return tutor's own courses (for tutor dashboard/courses page)
    if (view === 'tutor') {
      const tutorId = user.tutorId || user.id;
      if (tutorId) {
        return this.coursesService.findAll(tutorId);
      }
    }
    
    // CRITICAL FIX: Students (even if also tutors) should ALWAYS see ALL courses from ALL approved tutors
    // This ensures all students see courses from all tutors, not just courses from tutors they're connected to
    
    // Convert roles to array if needed
    const roles = user.roles || [];
    const rolesArray = Array.isArray(roles) 
      ? roles 
      : (typeof roles === 'string' ? JSON.parse(roles || '[]') : []);
    
    // Get tutorId if user is also a tutor (to exclude their own courses)
    // First try from JWT, then from roles, then look up by email if needed
    let tutorId = user.tutorId || (rolesArray.includes('tutor') ? user.id : null);
    
    // If tutorId is missing but user has tutor role or email, try to find by email
    if (!tutorId && user.email && (rolesArray.includes('tutor') || user.type === 'tutor')) {
      try {
        const tutor = await this.tutorsService.findByEmail(user.email);
        if (tutor) {
          tutorId = tutor.id;
        }
      } catch (error) {
        // Tutor not found by email - that's okay, continue
        console.log('Could not find tutor by email:', user.email);
      }
    }
    
    // CHECK 1: If user has studentId, they're definitely a student - show all courses except their own tutor courses
    if (user.studentId) {
      return this.coursesService.findAllAvailable(tutorId);
    }
    
    // CHECK 2: If user has 'student' role, show all courses except their own tutor courses
    if (rolesArray.includes('student') || rolesArray.includes('"student"')) {
      return this.coursesService.findAllAvailable(tutorId);
    }
    
    // CHECK 3: If user type is 'student', show all courses except their own tutor courses
    if (user.type === 'student') {
      return this.coursesService.findAllAvailable(tutorId);
    }
    
    // ONLY if user is PURELY a tutor (no student identifier at all), show their own courses
    // This means they must have tutorId AND NOT have studentId
    const hasOnlyTutorRole = (tutorId || rolesArray.includes('tutor')) && !user.studentId;
    
    if (hasOnlyTutorRole && user.type !== 'student') {
      return this.coursesService.findAll(tutorId || user.id);
    }
    
    // Default: show all available courses (safest for students viewing) except their own tutor courses
    return this.coursesService.findAllAvailable(tutorId);
  }

  @Get(':id')
  findOne(@CurrentUser() tutor: any, @Param('id') id: string) {
    return this.coursesService.findOne(id, tutor.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() tutor: any,
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, tutor.id, updateCourseDto);
  }

  @Delete(':id')
  remove(@CurrentUser() tutor: any, @Param('id') id: string) {
    return this.coursesService.remove(id, tutor.id);
  }
}

