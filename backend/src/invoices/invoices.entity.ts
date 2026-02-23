import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BursaryStudent } from '../bursary-students/bursary-students.entity';
import { Course } from '../courses/courses.entity';
import { TutorRequest } from '../tutor-requests/tutor-requests.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryColumn({ name: 'unique_id' })
  uniqueId: string;

  @Column({ name: 'invoice_number', unique: true })
  invoiceNumber: string;

  @Column({ name: 'student_email' })
  studentEmail: string;

  @Column({ name: 'student_name' })
  studentName: string;

  @Column({ name: 'bursary_student_id', nullable: true })
  bursaryStudentId: string;

  @Column({ name: 'course_id', nullable: true })
  courseId: string;

  @Column({ name: 'course_name', nullable: true })
  courseName: string;

  @Column({ name: 'request_unique_id', nullable: true })
  requestUniqueId: string;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @Column({ name: 'issue_date', type: 'date' })
  issueDate: Date;

  @Column({ name: 'status', default: 'pending' })
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod: string;

  @Column({ name: 'payment_date', type: 'timestamp', nullable: true })
  paymentDate: Date;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'bursary_name', nullable: true })
  bursaryName: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

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
  @ManyToOne(() => BursaryStudent)
  @JoinColumn({ name: 'bursary_student_id', referencedColumnName: 'uniqueId' })
  student: BursaryStudent;

  @ManyToOne(() => Course, (course) => course.uniqueId)
  @JoinColumn({ name: 'course_id', referencedColumnName: 'uniqueId' })
  course: Course;

  @ManyToOne(() => TutorRequest, { nullable: true })
  @JoinColumn({ name: 'request_unique_id', referencedColumnName: 'uniqueId' })
  request: TutorRequest;
}
