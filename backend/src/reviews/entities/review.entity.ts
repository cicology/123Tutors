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
import { Lesson } from '../../lessons/entities/lesson.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tutorId: string;

  @ManyToOne(() => Tutor, (tutor) => tutor.reviews)
  @JoinColumn({ name: 'tutorId' })
  tutor: Tutor;

  @Column()
  studentId: string;

  @ManyToOne(() => Student, (student) => student.reviews)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ nullable: true })
  lessonId: string;

  @OneToOne(() => Lesson, (lesson) => lesson.review)
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @Column({ type: 'int' })
  rating: number;

  @Column('text', { nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

