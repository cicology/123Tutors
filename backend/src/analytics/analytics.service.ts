import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Analytics } from './entities/analytics.entity';
import { Lesson, LessonStatus } from '../lessons/entities/lesson.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Review } from '../reviews/entities/review.entity';
import { CourseRequest, RequestStatus } from '../requests/entities/course-request.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Analytics)
    private analyticsRepository: Repository<Analytics>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(CourseRequest)
    private requestRepository: Repository<CourseRequest>,
  ) {}

  async getDashboardStats(tutorId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // This month's earnings
    const thisMonthPayments = await this.paymentRepository.find({
      where: {
        tutorId,
        status: PaymentStatus.COMPLETED,
        paidAt: Between(startOfMonth, now),
      },
    });
    const thisMonthEarnings = thisMonthPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    // Last month's earnings
    const lastMonthPayments = await this.paymentRepository.find({
      where: {
        tutorId,
        status: PaymentStatus.COMPLETED,
        paidAt: Between(startOfLastMonth, endOfLastMonth),
      },
    });
    const lastMonthEarnings = lastMonthPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    // Total earnings
    const allPayments = await this.paymentRepository.find({
      where: {
        tutorId,
        status: PaymentStatus.COMPLETED,
      },
    });
    const totalEarnings = allPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    // Pending payments
    const pendingPayments = await this.paymentRepository.find({
      where: {
        tutorId,
        status: PaymentStatus.PENDING,
      },
    });
    const pendingAmount = pendingPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    // Completed lessons this month
    const thisMonthLessons = await this.lessonRepository.find({
      where: {
        tutorId,
        status: LessonStatus.COMPLETED,
        completedAt: Between(startOfMonth, now),
      },
    });
    const hoursTaught = thisMonthLessons.reduce(
      (sum, lesson) => sum + lesson.duration,
      0,
    ) / 60;

    // Average rating
    const reviews = await this.reviewRepository.find({
      where: { tutorId },
      select: ['rating'],
    });
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    // Calculate outstanding amounts from accepted requests
    // This is the total price from accepted requests minus what's been paid
    const acceptedRequests = await this.requestRepository.find({
      where: {
        tutorId,
        status: RequestStatus.ACCEPTED,
      },
    });

    let totalOutstanding = 0;
    for (const request of acceptedRequests) {
      if (request.totalPrice) {
        const requestTotal = Number(request.totalPrice);
        
        // Find payments for this request
        const requestPayments = await this.paymentRepository.find({
          where: {
            tutorId,
            requestId: request.id,
            status: PaymentStatus.COMPLETED,
          },
        });
        
        const paidAmount = requestPayments.reduce(
          (sum, payment) => sum + Number(payment.amount),
          0,
        );
        
        // Outstanding is what's not yet paid
        const outstanding = requestTotal - paidAmount;
        if (outstanding > 0) {
          totalOutstanding += outstanding;
        }
      }
    }

    return {
      thisMonth: {
        earnings: thisMonthEarnings,
        lessons: thisMonthLessons.length,
        hours: hoursTaught,
      },
      lastMonth: {
        earnings: lastMonthEarnings,
      },
      total: {
        earnings: totalEarnings,
      },
      pending: {
        payments: pendingAmount,
      },
      outstanding: {
        amount: totalOutstanding,
      },
      rating: {
        average: averageRating,
        count: reviews.length,
      },
    };
  }

  async getMonthlyAnalytics(tutorId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const lessons = await this.lessonRepository.find({
      where: {
        tutorId,
        scheduledAt: Between(startDate, endDate),
      },
    });

    const payments = await this.paymentRepository.find({
      where: {
        tutorId,
        paidAt: Between(startDate, endDate),
      },
    });

    return {
      lessons: lessons.length,
      completedLessons: lessons.filter((l) => l.status === LessonStatus.COMPLETED).length,
      earnings: payments
        .filter((p) => p.status === PaymentStatus.COMPLETED)
        .reduce((sum, p) => sum + Number(p.amount), 0),
    };
  }
}

