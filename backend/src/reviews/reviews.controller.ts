import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createReviewDto: CreateReviewDto) {
    // Students can create reviews
    const studentId = user.studentId || user.id;
    return this.reviewsService.create(studentId, createReviewDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    // Tutors view their reviews, students view reviews they've written
    if (user.tutorId || (user.roles && user.roles.includes('tutor'))) {
      const tutorId = user.tutorId || user.id;
      return this.reviewsService.findAll(tutorId);
    }
    // Return empty for students viewing their own reviews (can add later)
    return [];
  }

  @Get('rating')
  getRating(@CurrentUser() user: any) {
    // Only tutors have ratings
    const tutorId = user.tutorId || user.id;
    return this.reviewsService.getTutorRating(tutorId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    if (user.tutorId) {
      return this.reviewsService.findOne(id, user.tutorId);
    }
    // Students can view their own reviews
    return this.reviewsService.findOne(id, '');
  }
}

