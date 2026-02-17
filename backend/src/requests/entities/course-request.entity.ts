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
import { Course } from '../../courses/entities/course.entity';

export enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  REFERRED = 'referred',
  CANCELLED = 'cancelled',
}

@Entity('course_requests')
export class CourseRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  tutorId: string;

  @ManyToOne(() => Tutor)
  @JoinColumn({ name: 'tutorId' })
  tutor: Tutor;

  @Column({ nullable: true })
  courseId: string;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Column('text', { nullable: true })
  preferredSchedule: string; // JSON string of days and times

  @Column('text', { nullable: true })
  message: string;

  @Column({ nullable: true })
  serviceType: string;

  @Column({ type: 'int', nullable: true })
  lessonCount: number;

  @Column({ type: 'int', nullable: true })
  lessonDuration: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalPrice: number;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ nullable: true })
  referredToTutorId: string; // If tutor refers to another tutor

  @ManyToOne(() => Tutor, { nullable: true })
  @JoinColumn({ name: 'referredToTutorId' })
  referredToTutor: Tutor;

  @Column({ default: false })
  studentAcceptedReferral: boolean;

  @Column({ default: false })
  referredTutorAccepted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


