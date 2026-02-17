import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tutor } from '../../tutors/entities/tutor.entity';
import { Student } from '../../auth/entities/student.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  STUDENT_CONFIRMED = 'student_confirmed',
  STUDENT_DECLINED = 'student_declined',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tutorId: string;

  @ManyToOne(() => Tutor, (tutor) => tutor.payments)
  @JoinColumn({ name: 'tutorId' })
  tutor: Tutor;

  @Column({ nullable: true })
  studentId: string;

  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ nullable: true })
  lessonId: string;

  @ManyToOne(() => Lesson, { nullable: true })
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @Column({ nullable: true })
  requestId: string; // Link to course request

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tutorAmount: number; // Amount after commission

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  commissionAmount: number; // Company commission (percentage)

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10 })
  commissionRate: number; // Percentage (e.g., 10 for 10%)

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ type: 'int', nullable: true })
  sessionDuration: number; // in minutes

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  studentConfirmedAt: Date;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  paystackReference: string; // Paystack transaction reference

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

