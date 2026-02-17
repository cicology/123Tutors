import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
  ) {}

  async findAll(tutorId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { tutorId },
      relations: ['student', 'lesson'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tutorId: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['student', 'lesson', 'tutor'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.tutorId !== tutorId) {
      throw new ForbiddenException('You do not have access to this review');
    }

    return review;
  }

  async create(studentId: string, createReviewDto: { lessonId: string; rating: number; comment?: string }): Promise<Review> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: createReviewDto.lessonId, studentId },
      relations: ['tutor'],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (lesson.status !== 'completed') {
      throw new ForbiddenException('Can only review completed lessons');
    }

    // Check if review already exists
    const existingReview = await this.reviewRepository.findOne({
      where: { lessonId: createReviewDto.lessonId },
    });

    if (existingReview) {
      throw new ForbiddenException('Review already exists for this lesson');
    }

    const review = this.reviewRepository.create({
      tutorId: lesson.tutorId,
      studentId,
      lessonId: createReviewDto.lessonId,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
    });

    const savedReview = await this.reviewRepository.save(review);

    // Update tutor rating
    await this.updateTutorRating(lesson.tutorId);

    // Complete payment after review is submitted
    await this.paymentsService.completePaymentAfterReview(createReviewDto.lessonId);

    return savedReview;
  }

  private async updateTutorRating(tutorId: string): Promise<void> {
    const ratingData = await this.getTutorRating(tutorId);
    // Update tutor entity rating (would need tutors service injection for this)
    // For now, we'll update it when tutors view their dashboard
  }

  async getTutorRating(tutorId: string): Promise<{ average: number; count: number }> {
    const reviews = await this.reviewRepository.find({
      where: { tutorId },
      select: ['rating'],
    });

    if (reviews.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / reviews.length;

    return { average, count: reviews.length };
  }
}

