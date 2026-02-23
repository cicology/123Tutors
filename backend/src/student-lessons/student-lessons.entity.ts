import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TutorRequest } from '../tutor-requests/tutor-requests.entity';
import { TutorSessionsOrder } from '../tutor-sessions-orders/tutor-sessions-orders.entity';

@Entity('student_lessons')
export class StudentLesson {
  @PrimaryColumn({ name: 'unique_id' })
  uniqueId: string;

  // Admin fields
  @Column({ name: 'admin_lesson_feedback', type: 'text', nullable: true })
  adminLessonFeedback: string;

  @Column({ name: 'admin_lesson_approved', type: 'boolean', default: false })
  adminLessonApproved: boolean;

  @Column({ name: 'admin_rejected_lesson_reviewed', type: 'boolean', default: false })
  adminRejectedLessonReviewed: boolean;

  @Column({ name: 'admin_tutor_outcome_feedback', type: 'text', nullable: true })
  adminTutorOutcomeFeedback: string;

  // Course fields
  @Column({ name: 'course_name', nullable: true })
  courseName: string;

  // Lesson fields
  @Column({ name: 'lesson_date', type: 'timestamp', nullable: true })
  lessonDate: Date;

  @Column({ name: 'lesson_hours', type: 'decimal', precision: 5, scale: 2, nullable: true })
  lessonHours: number;

  @Column({ name: 'lesson_institute', nullable: true })
  lessonInstitute: string;

  @Column({ name: 'lesson_learning_type', nullable: true })
  lessonLearningType: string;

  @Column({ name: 'lesson_location', nullable: true })
  lessonLocation: string;

  @Column({ name: 'lesson_location_type', nullable: true })
  lessonLocationType: string;

  @Column({ name: 'lesson_time_description', nullable: true })
  lessonTimeDescription: string;

  @Column({ name: 'lesson_venue_other', nullable: true })
  lessonVenueOther: string;

  @Column({ name: 'lesson_rejected', type: 'boolean', default: false })
  lessonRejected: boolean;

  // Order fields
  @Column({ name: 'order_id' })
  orderId: string;

  // Payment fields
  @Column({ name: 'payment_status', nullable: true })
  paymentStatus: string;

  // Request fields
  @Column({ name: 'request_unique_id' })
  requestUniqueId: string;

  // Student fields
  @Column({ name: 'student_lesson_feedback', type: 'text', nullable: true })
  studentLessonFeedback: string;

  @Column({ name: 'student_lesson_rating', type: 'int', nullable: true })
  studentLessonRating: number;

  @Column({ name: 'student_name', nullable: true })
  studentName: string;

  @Column({ name: 'student_review_date', type: 'timestamp', nullable: true })
  studentReviewDate: Date;

  @Column({ name: 'student_reviewed', type: 'boolean', default: false })
  studentReviewed: boolean;

  // Swapout fields
  @Column({ name: 'swapout_review', type: 'text', nullable: true })
  swapoutReview: string;

  // Tutor fields
  @Column({ name: 'tutor_earning', type: 'decimal', precision: 10, scale: 2, nullable: true })
  tutorEarning: number;

  @Column({ name: 'tutor_feedback_about_student', type: 'text', nullable: true })
  tutorFeedbackAboutStudent: string;

  @Column({ name: 'tutor_paid', type: 'boolean', default: false })
  tutorPaid: boolean;

  @Column({ name: 'tutor_rating_of_student', type: 'decimal', precision: 3, scale: 1, nullable: true })
  tutorRatingOfStudent: number;

  @Column({ name: 'tutor_unique_id', nullable: true })
  tutorUniqueId: string;

  @Column({ name: 'tutor_name', nullable: true })
  tutorName: string;

  @Column({ name: 'tutor_rate_per_hour', type: 'decimal', precision: 10, scale: 2, nullable: true })
  tutorRatePerHour: number;

  // User fields
  @Column({ name: 'user_id_student', nullable: true })
  userIdStudent: string;

  // Audit fields
  @CreateDateColumn({ name: 'creation_date' })
  creationDate: Date;

  @UpdateDateColumn({ name: 'modified_date' })
  modifiedDate: Date;

  @Column({ name: 'slug', nullable: true })
  slug: string;

  @Column({ name: 'creator', nullable: true })
  creator: string;

  // Relations
  @ManyToOne(() => TutorRequest, (tutorRequest) => tutorRequest.studentLessons)
  @JoinColumn({ name: 'request_unique_id', referencedColumnName: 'uniqueId' })
  request: TutorRequest;

  @ManyToOne(() => TutorSessionsOrder, (tutorSessionsOrder) => tutorSessionsOrder.studentLessons)
  @JoinColumn({ name: 'order_id', referencedColumnName: 'uniqueId' })
  order: TutorSessionsOrder;
}
