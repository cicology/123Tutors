import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Tutor } from '../../tutors/entities/tutor.entity';
import { Student } from '../../auth/entities/student.entity';
import { Course } from '../../courses/entities/course.entity';
import { Review } from '../../reviews/entities/review.entity';

export enum LessonStatus {
  REQUESTED = 'requested', // Student requested, awaiting tutor approval
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum LessonType {
  ONLINE = 'online',
  IN_PERSON = 'in_person',
}

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tutorId: string;

  @ManyToOne(() => Tutor, (tutor) => tutor.lessons)
  @JoinColumn({ name: 'tutorId' })
  tutor: Tutor;

  @Column()
  studentId: string;

  @ManyToOne(() => Student, (student) => student.lessons)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ nullable: true })
  courseId: string;

  @ManyToOne(() => Course, (course) => course.lessons, { nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  subject: string;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'int' })
  duration: number;

  @Column({
    type: 'enum',
    enum: LessonType,
    default: LessonType.ONLINE,
  })
  type: LessonType;

  @Column({
    type: 'enum',
    enum: LessonStatus,
    default: LessonStatus.SCHEDULED,
  })
  status: LessonStatus;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @Column({ type: 'int', nullable: true })
  actualDuration: number; // in minutes

  @Column({ nullable: true })
  requestId: string; // Link to course request

  @Column({ default: false })
  isRecurring: boolean;

  @Column({ nullable: true })
  recurringPattern: string; // JSON: { frequency: 'weekly', days: ['monday', 'wednesday'], endDate: ... }

  @Column({ nullable: true })
  parentLessonId: string; // For recurring lessons

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalAmount: number;

  @OneToOne(() => Review, (review) => review.lesson, { nullable: true })
  review: Review;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

