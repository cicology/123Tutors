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
import { CourseRequest } from '../../requests/entities/course-request.entity';

export enum NotificationType {
  REQUEST_RECEIVED = 'request_received',
  REQUEST_ACCEPTED = 'request_accepted',
  REQUEST_DECLINED = 'request_declined',
  REQUEST_REFERRED = 'request_referred',
  REFERRAL_ACCEPTED = 'referral_accepted',
  REFERRAL_DECLINED = 'referral_declined',
  SESSION_SCHEDULED = 'session_scheduled',
  SESSION_CANCELLED = 'session_cancelled',
  SESSION_STARTED = 'session_started',
  SESSION_ENDED = 'session_ended',
  SESSION_COMPLETED = 'session_completed',
  PAYMENT_DUE = 'payment_due',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  PAYMENT_DECLINED = 'payment_declined',
  MESSAGE_RECEIVED = 'message_received',
}

export enum NotificationRecipientType {
  TUTOR = 'tutor',
  STUDENT = 'student',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationRecipientType,
  })
  recipientType: NotificationRecipientType;

  @Column({ nullable: true })
  tutorId: string;

  @ManyToOne(() => Tutor, { nullable: true })
  @JoinColumn({ name: 'tutorId' })
  tutor: Tutor;

  @Column({ nullable: true })
  studentId: string;

  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ nullable: true })
  requestId: string;

  @ManyToOne(() => CourseRequest, { nullable: true })
  @JoinColumn({ name: 'requestId' })
  request: CourseRequest;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


