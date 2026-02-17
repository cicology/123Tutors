import { Controller, Get, Post, Patch, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createRequest(
    @CurrentUser() user: any,
    @Body()
    body: {
      tutorId: string;
      courseId?: string;
      preferredSchedule: string;
      message?: string;
      serviceType?: string;
      lessonCount?: number;
      lessonDuration?: number;
      totalPrice?: number;
      notes?: string;
    },
  ) {
    const studentId = user.studentId || user.id;
    if (!studentId) {
      console.error('[RequestsController] No studentId found in user object:', user);
      throw new BadRequestException('Student ID is required to create a request');
    }
    console.log('[RequestsController] createRequest studentId:', studentId, 'email:', user?.email, 'user:', { id: user.id, studentId: user.studentId, type: user.type, roles: user.roles });
    return this.requestsService.createRequest(studentId, user?.email, body);
  }

  @Get('tutor')
  @UseGuards(JwtAuthGuard)
  async getTutorRequests(@CurrentUser() user: any) {
    const tutorId = user.tutorId || user.id;
    return this.requestsService.getTutorRequests(tutorId);
  }

  @Get('student')
  @UseGuards(JwtAuthGuard)
  async getStudentRequests(@CurrentUser() user: any) {
    const studentId = user.studentId || user.id;
    return this.requestsService.getStudentRequests(studentId);
  }

  @Patch(':id/accept')
  @UseGuards(JwtAuthGuard)
  async acceptRequest(@CurrentUser() user: any, @Param('id') id: string) {
    // Ensure we have tutorId - required for accepting requests
    let tutorId = user.tutorId;
    
    // Convert roles to array if needed for proper checking
    const roles = user.roles || [];
    const rolesArray = Array.isArray(roles) 
      ? roles 
      : (typeof roles === 'string' ? JSON.parse(roles || '[]') : []);
    
    // Fallback: if user has tutor role but no tutorId, try using id
    if (!tutorId) {
      if (rolesArray.includes('tutor') || user.type === 'tutor') {
        tutorId = user.id;
      }
    }
    
    if (!tutorId) {
      throw new BadRequestException(
        `Tutor ID is required to accept requests. User roles: ${JSON.stringify(rolesArray)}, tutorId: ${user.tutorId}, id: ${user.id}`
      );
    }
    
    return this.requestsService.acceptRequest(id, tutorId);
  }

  @Patch(':id/decline')
  @UseGuards(JwtAuthGuard)
  async declineRequest(@CurrentUser() user: any, @Param('id') id: string) {
    // Ensure we have tutorId - required for declining requests
    let tutorId = user.tutorId;
    
    // Convert roles to array if needed for proper checking
    const roles = user.roles || [];
    const rolesArray = Array.isArray(roles) 
      ? roles 
      : (typeof roles === 'string' ? JSON.parse(roles || '[]') : []);
    
    // Fallback: if user has tutor role but no tutorId, try using id
    if (!tutorId) {
      if (rolesArray.includes('tutor') || user.type === 'tutor') {
        tutorId = user.id;
      }
    }
    
    if (!tutorId) {
      throw new BadRequestException('Tutor ID is required to decline requests');
    }
    
    return this.requestsService.declineRequest(id, tutorId);
  }

  @Patch(':id/refer')
  @UseGuards(JwtAuthGuard)
  async referRequest(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { referredToTutorId: string },
  ) {
    // Ensure we have tutorId - required for referring requests
    let tutorId = user.tutorId;
    
    // Convert roles to array if needed for proper checking
    const roles = user.roles || [];
    const rolesArray = Array.isArray(roles) 
      ? roles 
      : (typeof roles === 'string' ? JSON.parse(roles || '[]') : []);
    
    // Fallback: if user has tutor role but no tutorId, try using id
    if (!tutorId) {
      if (rolesArray.includes('tutor') || user.type === 'tutor') {
        tutorId = user.id;
      }
    }
    
    if (!tutorId) {
      throw new BadRequestException('Tutor ID is required to refer requests');
    }
    
    return this.requestsService.referRequest(id, tutorId, body.referredToTutorId);
  }

  @Patch(':id/accept-referral-student')
  @UseGuards(JwtAuthGuard)
  async acceptReferralByStudent(@CurrentUser() user: any, @Param('id') id: string) {
    const studentId = user.studentId || user.id;
    return this.requestsService.acceptReferralByStudent(id, studentId);
  }

  @Patch(':id/accept-referral-tutor')
  @UseGuards(JwtAuthGuard)
  async acceptReferralByTutor(@CurrentUser() user: any, @Param('id') id: string) {
    let tutorId = user.tutorId;
    const roles = user.roles || [];
    const rolesArray = Array.isArray(roles) 
      ? roles 
      : (typeof roles === 'string' ? JSON.parse(roles || '[]') : []);
    
    if (!tutorId) {
      if (rolesArray.includes('tutor') || user.type === 'tutor') {
        tutorId = user.id;
      }
    }
    
    if (!tutorId) {
      throw new BadRequestException('Tutor ID is required to accept referred requests');
    }
    
    return this.requestsService.acceptReferralByTutor(id, tutorId);
  }

}

