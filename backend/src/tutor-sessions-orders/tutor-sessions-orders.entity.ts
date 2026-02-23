import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TutorRequest } from '../tutor-requests/tutor-requests.entity';
import { PromoCode } from '../promo-codes/promo-codes.entity';
import { TutorStudentHour } from '../tutor-student-hours/tutor-student-hours.entity';
import { StudentLesson } from '../student-lessons/student-lessons.entity';

@Entity('tutor_sessions_orders')
export class TutorSessionsOrder {
  @PrimaryColumn({ name: 'unique_id' })
  uniqueId: string;

  // Company fields
  @Column({ name: 'company_total_payment_earning', type: 'decimal', precision: 10, scale: 2, nullable: true })
  companyTotalPaymentEarning: number;

  @Column({ name: 'company_rate_per_hour', type: 'decimal', precision: 10, scale: 2, nullable: true })
  companyRatePerHour: number;

  // Course fields
  @Column({ name: 'course', nullable: true })
  course: string;

  @Column({ name: 'course_request_id', nullable: true })
  courseRequestId: string;

  @Column({ name: 'full_allocation_course', type: 'text', nullable: true })
  fullAllocationCourse: string;

  // Duration fields
  @Column({ name: 'duration_of_tutoring', nullable: true })
  durationOfTutoring: string;

  @Column({ name: 'duration_per_lesson', nullable: true })
  durationPerLesson: string;

  // Hours fields
  @Column({ name: 'hours', type: 'decimal', precision: 5, scale: 2, nullable: true })
  hours: number;

  @Column({ name: 'hours_booking_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  hoursBookingAmount: number;

  @Column({ name: 'hours_remaining', type: 'decimal', precision: 5, scale: 2, nullable: true })
  hoursRemaining: number;

  // Institute fields
  @Column({ name: 'institute', nullable: true })
  institute: string;

  @Column({ name: 'learning_type', nullable: true })
  learningType: string;

  // Lessons fields
  @Column({ name: 'lessons_per_week', type: 'int', nullable: true })
  lessonsPerWeek: number;

  // Payment fields
  @Column({ name: 'paid', type: 'boolean', default: false })
  paid: boolean;

  @Column({ name: 'platform_fee', type: 'decimal', precision: 10, scale: 2, nullable: true })
  platformFee: number;

  @Column({ name: 'refund', type: 'decimal', precision: 10, scale: 2, nullable: true })
  refund: number;

  // Promo code fields
  @Column({ name: 'promo_code', nullable: true })
  promoCode: string;

  @Column({ name: 'promo_code_applied', type: 'boolean', default: false })
  promoCodeApplied: boolean;

  @Column({ name: 'promo_code_discount_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  promoCodeDiscountAmount: number;

  @Column({ name: 'promo_code_discount_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  promoCodeDiscountPercentage: number;

  // Recipient fields
  @Column({ name: 'recipient_email', nullable: true })
  recipientEmail: string;

  // Request fields
  @Column({ name: 'request_id' })
  requestId: string;

  @Column({ name: 'request_invoice_num', nullable: true })
  requestInvoiceNum: string;

  // School fields
  @Column({ name: 'school_grade', nullable: true })
  schoolGrade: string;

  @Column({ name: 'school_syllabus', nullable: true })
  schoolSyllabus: string;

  @Column({ name: 'school_syllabus_other', nullable: true })
  schoolSyllabusOther: string;

  @Column({ name: 'school_type', nullable: true })
  schoolType: string;

  // Student fields
  @Column({ name: 'student_email' })
  studentEmail: string;

  @Column({ name: 'student_name', nullable: true })
  studentName: string;

  @Column({ name: 'student_rate_per_hour', type: 'decimal', precision: 10, scale: 2, nullable: true })
  studentRatePerHour: number;

  // Swapout fields
  @Column({ name: 'swap_out', type: 'boolean', default: false })
  swapOut: boolean;

  @Column({ name: 'swap_out_feedback', type: 'text', nullable: true })
  swapOutFeedback: string;

  // Total amount fields
  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalAmount: number;

  @Column({ name: 'total_amount_promo', type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalAmountPromo: number;

  // Tutor fields
  @Column({ name: 'tutor_application_id', nullable: true })
  tutorApplicationId: string;

  @Column({ name: 'tutor_availability', nullable: true })
  tutorAvailability: string;

  @Column({ name: 'tutor_earning', type: 'decimal', precision: 10, scale: 2, nullable: true })
  tutorEarning: number;

  @Column({ name: 'tutor_email', nullable: true })
  tutorEmail: string;

  @Column({ name: 'tutor_id', nullable: true })
  tutorId: string;

  @Column({ name: 'tutor_rate_discount_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  tutorRateDiscountAmount: number;

  @Column({ name: 'tutor_rate_per_hour', type: 'decimal', precision: 10, scale: 2, nullable: true })
  tutorRatePerHour: number;

  @Column({ name: 'tutor_rate_per_hour_promo', type: 'decimal', precision: 10, scale: 2, nullable: true })
  tutorRatePerHourPromo: number;

  @Column({ name: 'tutoring_with', nullable: true })
  tutoringWith: string;

  // User fields
  @Column({ name: 'user_id', nullable: true })
  userId: string;

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
  @ManyToOne(() => TutorRequest, (tutorRequest) => tutorRequest.tutorSessionsOrders)
  @JoinColumn({ name: 'request_id', referencedColumnName: 'uniqueId' })
  request: TutorRequest;

  @ManyToOne(() => PromoCode, (promoCode) => promoCode.tutorSessionsOrders)
  @JoinColumn({ name: 'promo_code', referencedColumnName: 'promoCode' })
  promoCodeEntity: PromoCode;

  @OneToMany(() => TutorStudentHour, (tutorStudentHour) => tutorStudentHour.order)
  tutorStudentHours: TutorStudentHour[];

  @OneToMany(() => StudentLesson, (studentLesson) => studentLesson.order)
  studentLessons: StudentLesson[];
}
