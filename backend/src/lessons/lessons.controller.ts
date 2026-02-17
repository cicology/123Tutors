import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('lessons')
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  create(@CurrentUser() tutor: any, @Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.create(tutor.id, createLessonDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    console.log('LessonsController.findAll - User from JWT:', JSON.stringify(user, null, 2));
    
    // If tutor, get their lessons; if student, get student lessons
    let tutorId: string | undefined;
    const roles = Array.isArray(user?.roles) ? user?.roles : (user?.roles ? [user.roles] : []);
    
    if (user?.tutorId || roles.includes('tutor') || roles.some((r: string) => r.includes('tutor'))) {
      tutorId = user?.tutorId || user?.id;
      console.log('Tutor detected, tutorId:', tutorId);
      return this.lessonsService.findAll(tutorId);
    }
    
    // Student
    const studentId = user?.studentId || user?.id;
    console.log('Student detected, studentId:', studentId);
    return this.lessonsService.findStudentLessons(studentId);
  }

  @Get('upcoming')
  findUpcoming(@CurrentUser() user: any) {
    if (user.tutorId || (user.roles && user.roles.includes('tutor'))) {
      const tutorId = user.tutorId || user.id;
      return this.lessonsService.findUpcoming(tutorId);
    }
    const studentId = user.studentId || user.id;
    return this.lessonsService.findStudentLessons(studentId);
  }

  @Get('calendar')
  getCalendar(
    @CurrentUser() user: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const tutorId = user.tutorId;
    const studentId = user.studentId;
    const monthNum = month ? parseInt(month) : undefined;
    const yearNum = year ? parseInt(year) : undefined;
    return this.lessonsService.getCalendarView(tutorId, studentId, monthNum, yearNum);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    // Allow both tutor and student to view their lessons
    if (user.tutorId) {
      return this.lessonsService.findOne(id, user.tutorId);
    }
    // For student
    const studentId = user.studentId || user.id;
    return this.lessonsService.findOneForStudent(id, studentId);
  }

  @Patch(':id')
  update(
    @CurrentUser() tutor: any,
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.update(id, tutor.id, updateLessonDto);
  }

  @Delete(':id')
  remove(@CurrentUser() tutor: any, @Param('id') id: string) {
    return this.lessonsService.remove(id, tutor.id);
  }

  @Post(':id/start')
  startSession(@CurrentUser() user: any, @Param('id') id: string) {
    const userType = user.tutorId ? 'tutor' : 'student';
    const userId = user.tutorId || user.studentId || user.id;
    return this.lessonsService.startSession(id, userId, userType);
  }

  @Post(':id/end')
  endSession(@CurrentUser() user: any, @Param('id') id: string) {
    const userType = user.tutorId ? 'tutor' : 'student';
    const userId = user.tutorId || user.studentId || user.id;
    return this.lessonsService.endSession(id, userId, userType);
  }

  @Patch(':id/cancel')
  cancelLesson(@CurrentUser() user: any, @Param('id') id: string) {
    const userType = user.tutorId ? 'tutor' : 'student';
    const userId = user.tutorId || user.studentId || user.id;
    return this.lessonsService.cancelLesson(id, userId, userType);
  }

  @Patch(':id/reschedule')
  rescheduleLesson(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { newScheduledAt: string },
  ) {
    const userType = user.tutorId ? 'tutor' : 'student';
    const userId = user.tutorId || user.studentId || user.id;
    return this.lessonsService.rescheduleLesson(id, userId, userType, new Date(body.newScheduledAt));
  }

  @Post('generate-from-request/:requestId')
  generateFromRequest(@CurrentUser() user: any, @Param('requestId') requestId: string) {
    // Only tutors can generate lessons
    const tutorId = user.tutorId || user.id;
    if (!tutorId) {
      throw new ForbiddenException('Only tutors can generate lessons');
    }
    return this.lessonsService.generateLessonsFromRequest(requestId);
  }

  @Post('regenerate-for-accepted')
  regenerateForAccepted(@CurrentUser() user: any) {
    // Only tutors can regenerate lessons
    const tutorId = user.tutorId || user.id;
    if (!tutorId) {
      throw new ForbiddenException('Only tutors can regenerate lessons');
    }
    return this.lessonsService.regenerateLessonsForAcceptedRequests(tutorId);
  }
}

