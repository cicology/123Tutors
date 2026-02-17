import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseRequest, RequestStatus } from './entities/course-request.entity';
import { Course } from '../courses/entities/course.entity';
import { Tutor } from '../tutors/entities/tutor.entity';
import { Student } from '../auth/entities/student.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { ReferralsService } from '../referrals/referrals.service';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(CourseRequest)
    private requestRepository: Repository<CourseRequest>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Tutor)
    private tutorRepository: Repository<Tutor>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    private referralsService: ReferralsService,
  ) {}

  async createRequest(
    studentId: string,
    studentEmail: string,
    payload: {
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
    try {
      console.log('[RequestsService] locating student studentId:', studentId, 'email:', studentEmail);
      let student: Student = null;
      if (studentId) {
        student = await this.studentRepository.findOne({ where: { id: studentId } });
        console.log('[RequestsService] found student by id:', !!student, student?.id);
      }

      if (!student && studentEmail) {
        student = await this.studentRepository.findOne({ where: { email: studentEmail } });
        console.log('[RequestsService] found student by email:', !!student, student?.id);
      }

      if (!student) {
        console.error('[RequestsService] Student not found - studentId:', studentId, 'email:', studentEmail);
        throw new NotFoundException('Student not found');
      }

      // Validate tutorId is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(payload.tutorId)) {
        console.error('[RequestsService] Invalid tutorId format - tutorId:', payload.tutorId);
        throw new BadRequestException('Invalid tutor ID format. Please select a valid tutor from the marketplace.');
      }

      const tutor = await this.tutorRepository.findOne({
        where: { id: payload.tutorId },
      });

      if (!tutor) {
        console.error('[RequestsService] Tutor not found - tutorId:', payload.tutorId);
        throw new NotFoundException('Tutor not found');
      }

      let course: Course = null;
      if (payload.courseId) {
        course = await this.courseRepository.findOne({
          where: { id: payload.courseId },
        });

        if (!course) {
          throw new NotFoundException('Course not found');
        }

        if (course.tutorId !== tutor.id) {
          throw new BadRequestException('Course does not belong to selected tutor');
        }

        if (course.isActive === false) {
          throw new BadRequestException('Course is not available');
        }
      }

      console.log('[RequestsService] Creating request with studentId:', student.id, 'tutorId:', tutor.id);
      const request = this.requestRepository.create({
        studentId: student.id,
        tutorId: tutor.id,
        courseId: course?.id ?? null,
        preferredSchedule: payload.preferredSchedule,
        message: payload.message,
        serviceType: payload.serviceType,
        lessonCount: payload.lessonCount,
        lessonDuration: payload.lessonDuration,
        totalPrice: payload.totalPrice,
        notes: payload.notes,
        status: RequestStatus.PENDING,
      });

      const savedRequest = await this.requestRepository.save(request);
      console.log('[RequestsService] Request saved successfully with id:', savedRequest.id);

      // Create notification for tutor
      try {
        await this.notificationsService.create({
          type: 'request_received' as any,
          recipientType: 'tutor' as any,
          tutorId: tutor.id,
          title: 'New Tutoring Request',
          message: `${student.firstName} ${student.lastName} requested your tutoring service${
            course ? ` for ${course.name}` : ''
          }.`,
          requestId: savedRequest.id,
        });
      } catch (error) {
        console.error('Error creating notification for tutor:', error);
      }

      return this.requestRepository.findOne({
        where: { id: savedRequest.id },
        relations: ['student', 'tutor', 'course'],
      });
    } catch (error) {
      console.error('[RequestsService] Error creating request:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      // Re-throw as BadRequestException for database errors
      throw new BadRequestException(`Failed to create request: ${error.message || 'Unknown error'}`);
    }
  }

  async getTutorRequests(tutorId: string) {
    return this.requestRepository.find({
      where: { tutorId },
      relations: ['student', 'course'],
      order: { createdAt: 'DESC' },
    });
  }

  async getStudentRequests(studentId: string) {
    return this.requestRepository.find({
      where: { studentId },
      relations: ['tutor', 'course'],
      order: { createdAt: 'DESC' },
    });
  }

  async acceptRequest(requestId: string, tutorId: string) {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['student', 'course', 'tutor'],
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    // Verify the tutor owns this request
    if (request.tutorId !== tutorId) {
      throw new BadRequestException(
        `You do not have permission to accept this request. Request belongs to tutor ${request.tutorId}, but you are tutor ${tutorId}`
      );
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(`Request cannot be accepted. Current status: ${request.status}`);
    }

    request.status = RequestStatus.ACCEPTED;
    await this.requestRepository.save(request);

    // Mark the "request_received" notification as read for the tutor
    await this.notificationsService.markRequestNotificationsAsRead(
      requestId,
      'request_received' as any,
    );

    await this.notificationsService.create({
      type: 'request_accepted' as any,
      recipientType: 'student' as any,
      studentId: request.studentId,
      title: 'Request Accepted',
      message: `${request.tutor.firstName} ${request.tutor.lastName} accepted your tutoring request. They will reach out to schedule lessons.`,
      requestId: request.id,
    });

    return request;
  }

  async declineRequest(requestId: string, tutorId: string) {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['student', 'course', 'tutor'],
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    // Verify the tutor owns this request
    if (request.tutorId !== tutorId) {
      throw new BadRequestException(
        `You do not have permission to decline this request. Request belongs to tutor ${request.tutorId}, but you are tutor ${tutorId}`
      );
    }

    if (request.status !== RequestStatus.PENDING && request.status !== RequestStatus.REFERRED) {
      throw new BadRequestException(`Request cannot be declined. Current status: ${request.status}`);
    }

    request.status = RequestStatus.DECLINED;
    await this.requestRepository.save(request);

    // Mark the "request_received" notification as read for the tutor
    await this.notificationsService.markRequestNotificationsAsRead(
      requestId,
      'request_received' as any,
    );

    await this.notificationsService.create({
      type: 'request_declined' as any,
      recipientType: 'student' as any,
      studentId: request.studentId,
      title: 'Request Declined',
      message: `${request.tutor.firstName} ${request.tutor.lastName} declined your request`,
      requestId: request.id,
    });

    return request;
  }

  async referRequest(requestId: string, tutorId: string, referredToTutorId: string) {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['student', 'course', 'tutor'],
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    // Verify the tutor owns this request
    if (request.tutorId !== tutorId) {
      throw new BadRequestException(
        `You do not have permission to refer this request. Request belongs to tutor ${request.tutorId}, but you are tutor ${tutorId}`
      );
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(`Request cannot be referred. Current status: ${request.status}`);
    }

    const referredTutor = await this.tutorRepository.findOne({
      where: { id: referredToTutorId },
    });

    if (!referredTutor) {
      throw new NotFoundException('Referred tutor not found');
    }

    request.status = RequestStatus.REFERRED;
    request.referredToTutorId = referredToTutorId;
    await this.requestRepository.save(request);

    // Create student referral record for reward tracking
    await this.referralsService.createStudentReferral(
      tutorId, // The tutor who made the referral
      requestId,
      referredToTutorId,
    );

    // Mark the "request_received" notification as read for the tutor
    await this.notificationsService.markRequestNotificationsAsRead(
      requestId,
      'request_received' as any,
    );

    // Notify student
    await this.notificationsService.create({
      type: 'request_referred' as any,
      recipientType: 'student' as any,
      studentId: request.studentId,
      title: 'Request Referred',
      message: `Your request was referred to ${referredTutor.firstName} ${referredTutor.lastName}. Please accept if you agree.`,
      requestId: request.id,
    });

    // Notify referred tutor
    await this.notificationsService.create({
      type: 'request_received' as any,
      recipientType: 'tutor' as any,
      tutorId: referredToTutorId,
      title: 'Referred Request',
      message: `${request.tutor.firstName} ${request.tutor.lastName} referred ${request.student.firstName} ${request.student.lastName}'s request to you`,
      requestId: request.id,
    });

    return request;
  }

  /**
   * Student accepts the referred request
   */
  async acceptReferralByStudent(requestId: string, studentId: string) {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['student', 'tutor', 'referredToTutor'],
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.studentId !== studentId) {
      throw new BadRequestException('You do not have permission to accept this referral');
    }

    if (request.status !== RequestStatus.REFERRED) {
      throw new BadRequestException('Request is not in referred status');
    }

    request.studentAcceptedReferral = true;
    await this.requestRepository.save(request);

    // Check if both student and referred tutor have accepted
    await this.checkAndCompleteStudentReferral(request);

    return request;
  }

  /**
   * Referred tutor accepts the referred request
   */
  async acceptReferralByTutor(requestId: string, referredTutorId: string) {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['student', 'tutor', 'referredToTutor'],
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.referredToTutorId !== referredTutorId) {
      throw new BadRequestException('You do not have permission to accept this referral');
    }

    if (request.status !== RequestStatus.REFERRED) {
      throw new BadRequestException('Request is not in referred status');
    }

    request.status = RequestStatus.ACCEPTED;
    request.referredTutorAccepted = true;
    await this.requestRepository.save(request);

    // Check if both student and referred tutor have accepted
    await this.checkAndCompleteStudentReferral(request);

    // Notify student
    await this.notificationsService.create({
      type: 'request_accepted' as any,
      recipientType: 'student' as any,
      studentId: request.studentId,
      title: 'Request Accepted',
      message: `${request.referredToTutor?.firstName} ${request.referredToTutor?.lastName} accepted your referred tutoring request.`,
      requestId: request.id,
    });

    return request;
  }

  /**
   * Check if both parties accepted and complete the referral reward
   */
  private async checkAndCompleteStudentReferral(request: CourseRequest) {
    if (request.studentAcceptedReferral && request.referredTutorAccepted) {
      // Both accepted - award reward to referring tutor
      await this.referralsService.completeStudentReferral(request.id);
    }
  }
}

