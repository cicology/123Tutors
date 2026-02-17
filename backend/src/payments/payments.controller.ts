import { Controller, Get, Post, Body, Param, Patch, UseGuards, ForbiddenException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { RequestPaymentDto } from './dto/request-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    // If tutor, get tutor payments; if student, get student payments
    if (user.tutorId || (user.roles && user.roles.includes('tutor'))) {
      const tutorId = user.tutorId || user.id;
      return this.paymentsService.findAll(tutorId);
    }
    // Student
    const studentId = user.studentId || user.id;
    return this.paymentsService.findStudentPayments(studentId);
  }

  @Get('summary')
  getSummary(@CurrentUser() user: any) {
    // Only tutors have payment summary
    const tutorId = user.tutorId || user.id;
    return this.paymentsService.getPaymentSummary(tutorId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    if (user.tutorId) {
      return this.paymentsService.findOne(id, user.tutorId);
    }
    // Students can view their own payments through findAll
    throw new ForbiddenException('Not authorized');
  }

  @Post('request')
  requestPayment(@CurrentUser() tutor: any, @Body() requestPaymentDto: RequestPaymentDto) {
    return this.paymentsService.requestPayment(
      tutor.id,
      requestPaymentDto.amount,
      requestPaymentDto.notes,
    );
  }

  @Post('from-session/:lessonId')
  createFromSession(@CurrentUser() user: any, @Param('lessonId') lessonId: string) {
    // Only tutor or system can create payment from session
    if (!user.tutorId) {
      throw new ForbiddenException('Only tutors can create payments from sessions');
    }
    return this.paymentsService.createPaymentFromSession(lessonId);
  }

  @Patch(':id/confirm')
  confirmPayment(@CurrentUser() user: any, @Param('id') id: string) {
    const studentId = user.studentId || user.id;
    return this.paymentsService.confirmPayment(id, studentId);
  }

  @Patch(':id/decline')
  declinePayment(@CurrentUser() user: any, @Param('id') id: string, @Body() body?: { reason?: string }) {
    const studentId = user.studentId || user.id;
    return this.paymentsService.declinePayment(id, studentId, body?.reason);
  }

  @Get('history')
  getSessionHistory(@CurrentUser() user: any) {
    const tutorId = user.tutorId || user.id;
    return this.paymentsService.findAll(tutorId);
  }

  @Post('request/:requestId/initialize')
  initializeRequestPayment(@CurrentUser() user: any, @Param('requestId') requestId: string) {
    const studentId = user.studentId || user.id;
    return this.paymentsService.createPaymentForRequest(requestId, studentId);
  }

  @Post('request/:requestId/verify')
  verifyRequestPayment(
    @CurrentUser() user: any,
    @Param('requestId') requestId: string,
    @Body() body: { paymentId: string; paystackReference: string; transactionId: string },
  ) {
    const studentId = user.studentId || user.id;
    return this.paymentsService.verifyPaystackPayment(body.paymentId, body.paystackReference, body.transactionId);
  }

  @Get('request/:requestId')
  getRequestPayment(@CurrentUser() user: any, @Param('requestId') requestId: string) {
    const studentId = user.studentId || user.id;
    return this.paymentsService.getPaymentByRequestId(requestId, studentId);
  }
}

