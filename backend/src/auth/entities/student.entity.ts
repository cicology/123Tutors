import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Chat } from '../../chats/entities/chat.entity';
import { CourseRequest } from '../../requests/entities/course-request.entity';

export enum BursaryApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DECLINED = 'declined',
}

@Entity('students')
export class Student {
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

  @Column({ nullable: true })
  level: string;

  @Column({ nullable: true })
  subject: string;

  @Column('text', { nullable: true })
  learningGoals: string;

  @Column({ default: false })
  hasBursary: boolean;

  @Column({ nullable: true })
  bursaryProvider: string;

  @Column({ nullable: true })
  bursaryContact: string;

  @Column({
    type: 'enum',
    enum: BursaryApprovalStatus,
    nullable: true,
  })
  bursaryApprovalStatus: BursaryApprovalStatus;

  @OneToMany(() => Lesson, (lesson) => lesson.student)
  lessons: Lesson[];

  @OneToMany(() => Review, (review) => review.student)
  reviews: Review[];

  @OneToMany(() => Chat, (chat) => chat.student)
  chats: Chat[];

  @OneToMany(() => CourseRequest, (request) => request.student)
  requests: CourseRequest[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

