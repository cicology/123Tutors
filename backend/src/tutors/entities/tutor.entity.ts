import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { TutorApplication } from './tutor-application.entity';
import { Course } from '../../courses/entities/course.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Chat } from '../../chats/entities/chat.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Referral } from '../../referrals/entities/referral.entity';
import { Analytics } from '../../analytics/entities/analytics.entity';

export enum TutorStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('tutors')
export class Tutor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  location: string;

  @Column('text', { nullable: true })
  subjects: string;

  @Column('text', { nullable: true })
  qualifications: string;

  @Column('text', { nullable: true })
  experience: string;

  @Column({ nullable: true })
  cvPath: string;

  @Column({ nullable: true })
  profilePicture: string; // Path to profile picture

  @Column({
    type: 'enum',
    enum: TutorStatus,
    default: TutorStatus.PENDING,
  })
  status: TutorStatus;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  totalSessions: number;

  @Column({ default: 0 })
  totalStudents: number;

  @Column('text', { nullable: true })
  cardInfo: string; // JSON string with card details

  @Column({ type: 'timestamp', nullable: true })
  firstLessonDate: Date; // Track when tutor started working

  @Column({ default: false })
  isAmbassador: boolean; // Ambassador status for referring tutors

  @Column({ default: 0 })
  tutorReferralsCount: number; // Number of successful tutor referrals

  @OneToOne(() => TutorApplication, (application) => application.tutor, {
    cascade: true,
  })
  application: TutorApplication;

  @OneToMany(() => Course, (course) => course.tutor)
  courses: Course[];

  @OneToMany(() => Lesson, (lesson) => lesson.tutor)
  lessons: Lesson[];

  @OneToMany(() => Review, (review) => review.tutor)
  reviews: Review[];

  @OneToMany(() => Chat, (chat) => chat.tutor)
  chats: Chat[];

  @OneToMany(() => Payment, (payment) => payment.tutor)
  payments: Payment[];

  @OneToMany(() => Referral, (referral) => referral.tutor)
  referrals: Referral[];

  @OneToMany(() => Analytics, (analytics) => analytics.tutor)
  analytics: Analytics[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

