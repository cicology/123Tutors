import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TutorRequest } from '../tutor-requests/tutor-requests.entity';
import { TutorSessionsOrder } from '../tutor-sessions-orders/tutor-sessions-orders.entity';

@Entity('tutor_student_hours')
export class TutorStudentHour {
  @PrimaryColumn({ name: 'unique_id' })
  uniqueId: string;

  @Column({ name: 'additional_hours', type: 'int', nullable: true })
  additionalHours: number;

  @Column({ name: 'course', nullable: true })
  course: string;

  @Column({ name: 'course_id', nullable: true })
  courseId: string;

  @Column({ name: 'hourly_rate_r', type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRateR: number;

  @Column({ name: 'invoice_no', nullable: true })
  invoiceNo: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'paid', type: 'boolean', default: false })
  paid: boolean;

  @Column({ name: 'request_id' })
  requestId: string;

  @Column({ name: 'spam_not_interested', type: 'boolean', default: false })
  spamNotInterested: boolean;

  @Column({ name: 'student_name', nullable: true })
  studentName: string;

  @Column({ name: 'total_amount_r', type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalAmountR: number;

  @Column({ name: 'tutor_email', nullable: true })
  tutorEmail: string;

  @Column({ name: 'tutor_name', nullable: true })
  tutorName: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @CreateDateColumn({ name: 'creation_date' })
  creationDate: Date;

  @UpdateDateColumn({ name: 'modified_date' })
  modifiedDate: Date;

  @Column({ name: 'slug', nullable: true })
  slug: string;

  @Column({ name: 'creator', nullable: true })
  creator: string;

  @ManyToOne(() => TutorRequest, (tutorRequest) => tutorRequest.tutorStudentHours)
  @JoinColumn({ name: 'request_id', referencedColumnName: 'uniqueId' })
  request: TutorRequest;

  @ManyToOne(() => TutorSessionsOrder, (tutorSessionsOrder) => tutorSessionsOrder.tutorStudentHours)
  @JoinColumn({ name: 'order_id', referencedColumnName: 'uniqueId' })
  order: TutorSessionsOrder;
}
