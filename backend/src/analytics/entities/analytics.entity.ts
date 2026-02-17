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

@Entity('analytics')
export class Analytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tutorId: string;

  @ManyToOne(() => Tutor, (tutor) => tutor.analytics)
  @JoinColumn({ name: 'tutorId' })
  tutor: Tutor;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'int', default: 0 })
  lessonsCompleted: number;

  @Column({ type: 'int', default: 0 })
  hoursTaught: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  earnings: number;

  @Column({ type: 'int', default: 0 })
  newStudents: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

