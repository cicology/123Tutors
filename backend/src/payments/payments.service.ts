import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Tutor } from '../tutors/entities/tutor.entity';
import { CourseRequest, RequestStatus } from '../requests/entities/course-request.entity';
import { Student } from '../auth/entities/student.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  private readonly DEFAULT_COMMISSION_RATE = 30; // %
  private readonly DEFAULT_SESSION_AMOUNT = 100; // R100 fallback per session

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Tutor)
    private tutorRepository: Repository<Tutor>,
    @InjectRepository(CourseRequest)
    private requestRepository: Repository<CourseRequest>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async findAll(tutorId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { tutorId },
      relations: ['lesson', 'student'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tutorId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.tutorId !== tutorId) {
      throw new ForbiddenException('You do not have access to this payment');
    }

    return payment;
  }

  async requestPayment(tutorId: string, amount: number, notes?: string): Promise<Payment> {
    // Check if tutor has worked 30 days
    const tutor = await this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoin('lesson.tutor', 'tutor')
      .where('lesson.tutorId = :tutorId', { tutorId })
      .andWhere('lesson.status = :status', { status: 'completed' })
      .andWhere('lesson.completedAt IS NOT NULL')
      .select('MIN(lesson.completedAt)', 'firstLesson')
      .getRawOne();

    if (!tutor || !tutor.firstLesson) {
      throw new BadRequestException('Tutor must have completed at least one lesson');
    }

    const firstLessonDate = new Date(tutor.firstLesson);
    const daysSinceFirstLesson = Math.floor(
      (Date.now() - firstLessonDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceFirstLesson < 30) {
      throw new BadRequestException(
        `Tutor must have been working for at least 30 days. Current: ${daysSinceFirstLesson} days`
      );
    }

    // Check if tutor has card info
    const tutorEntity = await this.tutorRepository.findOne({ 
      where: { id: tutorId }, 
      select: ['cardInfo'] 
    });

    if (!tutorEntity || !tutorEntity.cardInfo) {
      throw new BadRequestException('Tutor must upload card information before requesting payment');
    }

    const payment = this.paymentRepository.create({
      tutorId,
      amount,
      notes,
      status: PaymentStatus.PENDING,
    });
    return this.paymentRepository.save(payment);
  }

  /**
   * Create payment automatically when session ends
   * Fixed rate: R100 per session (R70 tutor, R30 commission)
   */
  async createPaymentFromSession(lessonId: string): Promise<Payment> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['tutor', 'student'],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (lesson.status !== 'completed') {
      throw new BadRequestException('Lesson must be completed before creating payment');
    }

    // Check if payment already exists for this lesson
    const existingPayment = await this.paymentRepository.findOne({
      where: { lessonId },
    });

    if (existingPayment) {
      return existingPayment;
    }

    const sessionDurationMinutes = lesson.actualDuration ?? lesson.duration ?? 60;
    const totalAmount = this.calculateLessonAmount(lesson);
    const commissionRate = this.DEFAULT_COMMISSION_RATE;
    const commissionAmount = Number((totalAmount * (commissionRate / 100)).toFixed(2));
    const tutorAmount = Number((totalAmount - commissionAmount).toFixed(2));

    const payment = this.paymentRepository.create({
      tutorId: lesson.tutorId,
      studentId: lesson.studentId,
      lessonId: lesson.id,
      amount: totalAmount,
      tutorAmount,
      commissionAmount,
      commissionRate,
      sessionDuration: sessionDurationMinutes,
      status: PaymentStatus.PENDING, // Awaiting student confirmation
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Format duration for notification
    const hours = Math.floor(sessionDurationMinutes / 60);
    const minutes = sessionDurationMinutes % 60;
    const durationText = hours > 0 
      ? `${hours}h ${minutes}m` 
      : `${minutes}m`;

    // Notify student about session completion and need for confirmation
    await this.notificationsService.create({
      type: 'session_completed' as any,
      recipientType: 'student' as any,
      studentId: lesson.studentId,
      title: 'Session Completed',
      message: `Your tutor has completed the session. Duration: ${durationText}. Amount: R${totalAmount.toFixed(2)}. Please confirm to finalize payment.`,
      requestId: null,
    });

    return savedPayment;
  }

  private calculateLessonAmount(lesson: Lesson): number {
    if (lesson.totalAmount !== null && lesson.totalAmount !== undefined) {
      return Number(lesson.totalAmount);
    }

    if (lesson.hourlyRate) {
      const durationMinutes = lesson.actualDuration ?? lesson.duration ?? 60;
      const perHour = Number(lesson.hourlyRate);
      if (durationMinutes > 0) {
        return Number((perHour * (durationMinutes / 60)).toFixed(2));
      }
    }

    // Fallback to default session rate
    return this.DEFAULT_SESSION_AMOUNT;
  }

  /**
   * Student confirms payment/session
   * Sets status to STUDENT_CONFIRMED - student can now leave a review
   * Payment is completed after review is submitted
   */
  async confirmPayment(paymentId: string, studentId: string): Promise<Payment> {
    // First try to find by studentId, if not found try by lesson's studentId
    let payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['tutor', 'lesson', 'lesson.student'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Verify student owns this payment (check payment studentId or lesson studentId)
    const paymentStudentId = payment.studentId || payment.lesson?.studentId;
    if (paymentStudentId && paymentStudentId !== studentId) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(`Payment cannot be confirmed. Current status: ${payment.status}`);
    }

    // Set to STUDENT_CONFIRMED - student can now leave review
    // Payment will be completed after review is submitted
    payment.status = PaymentStatus.STUDENT_CONFIRMED;
    payment.studentConfirmedAt = new Date();
    const confirmedPayment = await this.paymentRepository.save(payment);

    // Notify tutor that student has accepted the session
    await this.notificationsService.create({
      type: 'payment_confirmed' as any,
      recipientType: 'tutor' as any,
      tutorId: payment.tutorId,
      title: 'Session Accepted',
      message: `Student accepted the session. They can now leave a review.`,
      requestId: null,
    });

    return confirmedPayment;
  }

  /**
   * Complete payment after review is submitted
   * This is called when student submits a review
   */
  async completePaymentAfterReview(lessonId: string): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { lessonId, status: PaymentStatus.STUDENT_CONFIRMED },
    });

    if (!payment) {
      // Payment might already be completed or doesn't exist
      return;
    }

    // Mark payment as completed and allocate funds
    payment.status = PaymentStatus.COMPLETED;
    payment.paidAt = new Date();
    await this.paymentRepository.save(payment);

    // Notify tutor that payment has been allocated
    await this.notificationsService.create({
      type: 'payment_completed' as any,
      recipientType: 'tutor' as any,
      tutorId: payment.tutorId,
      title: 'Payment Allocated',
      message: `Payment of R${Number(payment.tutorAmount || payment.amount).toFixed(2)} has been allocated to your account.`,
      requestId: null,
    });
  }

  /**
   * Student declines payment/session
   */
  async declinePayment(paymentId: string, studentId: string, reason?: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['tutor', 'lesson', 'lesson.student'],
    });

    // Verify student owns this payment (check payment studentId or lesson studentId)
    const paymentStudentId = payment?.studentId || payment?.lesson?.studentId;
    if (!payment || (paymentStudentId && paymentStudentId !== studentId)) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment cannot be declined');
    }

    payment.status = PaymentStatus.STUDENT_DECLINED;
    if (reason) {
      payment.notes = reason;
    }
    const declinedPayment = await this.paymentRepository.save(payment);

    // Notify tutor
    await this.notificationsService.create({
      type: 'payment_declined' as any,
      recipientType: 'tutor' as any,
      tutorId: payment.tutorId,
      title: 'Session Declined',
      message: `Student declined the session. Amount: R${Number(payment.amount).toFixed(2)}.${reason ? ` Reason: ${reason}` : ''}`,
      requestId: null,
    });

    return declinedPayment;
  }

  /**
   * Get payments for student
   */
  async findStudentPayments(studentId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { studentId },
      relations: ['tutor', 'lesson'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPaymentSummary(tutorId: string) {
    const payments = await this.findAll(tutorId);
    
    // Use tutorAmount (after commission) for earnings
    // Only count completed payments (exclude declined)
    const total = payments
      .filter((p) => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum + Number(p.tutorAmount || p.amount), 0);
    
    // Pending includes awaiting student confirmation and student confirmed (not yet finalized)
    const pending = payments
      .filter((p) => p.status === PaymentStatus.PENDING || p.status === PaymentStatus.STUDENT_CONFIRMED)
      .reduce((sum, p) => sum + Number(p.tutorAmount || p.amount), 0);
    
    const now = new Date();
    const thisMonth = payments
      .filter((p) => {
        if (p.status !== PaymentStatus.COMPLETED || !p.paidAt) return false;
        const paymentDate = new Date(p.paidAt);
        return paymentDate.getMonth() === now.getMonth() && 
               paymentDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, p) => sum + Number(p.tutorAmount || p.amount), 0);

    const lastMonth = payments
      .filter((p) => {
        if (p.status !== PaymentStatus.COMPLETED || !p.paidAt) return false;
        const paymentDate = new Date(p.paidAt);
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return paymentDate >= lastMonthDate && paymentDate <= lastMonthEnd;
      })
      .reduce((sum, p) => sum + Number(p.tutorAmount || p.amount), 0);

    // Calculate total hours worked
    const totalHours = payments
      .filter((p) => p.status === PaymentStatus.COMPLETED && p.sessionDuration)
      .reduce((sum, p) => sum + (p.sessionDuration || 0), 0) / 60;

    return {
      total,
      pending,
      thisMonth,
      lastMonth,
      totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal
      totalSessions: payments.filter((p) => p.status === PaymentStatus.COMPLETED).length,
    };
  }

  /**
   * Create payment for an approved request
   * This initializes a payment record for Paystack processing
   */
  async createPaymentForRequest(requestId: string, studentId: string): Promise<Payment> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['student', 'tutor', 'course'],
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.studentId !== studentId) {
      throw new ForbiddenException('You do not have permission to pay for this request');
    }

    if (request.status !== RequestStatus.ACCEPTED) {
      throw new BadRequestException('Request must be accepted before payment can be made');
    }

    // Check if payment already exists for this request
    const existingPayment = await this.paymentRepository.findOne({
      where: { requestId, studentId },
    });

    if (existingPayment) {
      if (existingPayment.status === PaymentStatus.COMPLETED) {
        throw new BadRequestException('Payment already completed for this request');
      }
      return existingPayment; // Return existing payment if not completed
    }

    if (!request.totalPrice || request.totalPrice <= 0) {
      throw new BadRequestException('Request does not have a valid total price');
    }

    // Calculate commission (30% default)
    const commissionRate = this.DEFAULT_COMMISSION_RATE;
    const commissionAmount = (Number(request.totalPrice) * commissionRate) / 100;
    const tutorAmount = Number(request.totalPrice) - commissionAmount;

    const payment = this.paymentRepository.create({
      requestId: request.id,
      studentId: request.studentId,
      tutorId: request.tutorId,
      amount: Number(request.totalPrice),
      tutorAmount,
      commissionAmount,
      commissionRate,
      status: PaymentStatus.PENDING,
      notes: `Payment for request: ${request.course?.name || request.serviceType || 'Custom tutoring'}`,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Generate Paystack reference
    const paystackReference = `req_${requestId}_${Date.now()}`;
    savedPayment.paystackReference = paystackReference;
    await this.paymentRepository.save(savedPayment);

    return savedPayment;
  }

  /**
   * Verify Paystack payment and update payment status
   */
  async verifyPaystackPayment(paymentId: string, paystackReference: string, transactionId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['student', 'tutor', 'request'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.paystackReference !== paystackReference) {
      throw new BadRequestException('Invalid Paystack reference');
    }

    // Verify payment with Paystack (in production, you would make an API call here)
    // For now, we'll mark it as completed when called
    payment.status = PaymentStatus.COMPLETED;
    payment.transactionId = transactionId;
    payment.paidAt = new Date();

    const verifiedPayment = await this.paymentRepository.save(payment);

    // Create notification for tutor
    await this.notificationsService.create({
      type: 'payment_completed' as any,
      recipientType: 'tutor' as any,
      tutorId: payment.tutorId,
      title: 'Payment Received',
      message: `Student has paid R${Number(payment.amount).toFixed(2)} for the tutoring request.`,
      requestId: payment.requestId,
    });

    // Create notification for student
    await this.notificationsService.create({
      type: 'payment_success' as any,
      recipientType: 'student' as any,
      studentId: payment.studentId,
      title: 'Payment Successful',
      message: `Your payment of R${Number(payment.amount).toFixed(2)} was processed successfully.`,
      requestId: payment.requestId,
    });

    return verifiedPayment;
  }

  /**
   * Get payment by request ID
   */
  async getPaymentByRequestId(requestId: string, studentId: string): Promise<Payment | null> {
    return this.paymentRepository.findOne({
      where: { requestId, studentId },
      relations: ['tutor', 'student'],
    });
  }

  /**
   * Get commission summary for admin
   */
  async getCommissionSummary() {
    const allPayments = await this.paymentRepository.find({
      relations: ['tutor', 'student', 'lesson'],
      order: { createdAt: 'DESC' },
    });

    const completedPayments = allPayments.filter(p => p.status === PaymentStatus.COMPLETED);
    
    const totalCommission = completedPayments.reduce(
      (sum, p) => sum + Number(p.commissionAmount || 0), 
      0
    );

    const thisMonthCommission = completedPayments
      .filter((p) => {
        if (!p.paidAt) return false;
        const now = new Date();
        const paymentDate = new Date(p.paidAt);
        return paymentDate.getMonth() === now.getMonth() && 
               paymentDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, p) => sum + Number(p.commissionAmount || 0), 0);

    // Group by tutor
    const byTutor: { [tutorId: string]: { tutor: any; totalCommission: number; sessions: number } } = {};
    completedPayments.forEach(p => {
      if (!byTutor[p.tutorId]) {
        byTutor[p.tutorId] = {
          tutor: p.tutor,
          totalCommission: 0,
          sessions: 0,
        };
      }
      byTutor[p.tutorId].totalCommission += Number(p.commissionAmount || 0);
      byTutor[p.tutorId].sessions += 1;
    });

    return {
      totalCommission,
      thisMonthCommission,
      totalSessions: completedPayments.length,
      byTutor: Object.values(byTutor).sort((a, b) => b.totalCommission - a.totalCommission),
      recentPayments: completedPayments.slice(0, 10).map(p => ({
        id: p.id,
        tutorName: `${p.tutor?.firstName} ${p.tutor?.lastName}`,
        studentName: `${p.student?.firstName} ${p.student?.lastName}`,
        amount: Number(p.amount),
        commissionAmount: Number(p.commissionAmount || 0),
        tutorAmount: Number(p.tutorAmount || 0),
        sessionDuration: p.sessionDuration,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
    };
  }
}

