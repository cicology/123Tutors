import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Tutor } from '../../tutors/entities/tutor.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tutorId: string;

  @ManyToOne(() => Tutor, (tutor) => tutor.courses)
  @JoinColumn({ name: 'tutorId' })
  tutor: Tutor;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ nullable: true })
  level: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Lesson, (lesson) => lesson.course)
  lessons: Lesson[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

