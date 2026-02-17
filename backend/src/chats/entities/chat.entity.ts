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
import { Student } from '../../auth/entities/student.entity';
import { Message } from './message.entity';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tutorId: string;

  @ManyToOne(() => Tutor, (tutor) => tutor.chats)
  @JoinColumn({ name: 'tutorId' })
  tutor: Tutor;

  @Column()
  studentId: string;

  @ManyToOne(() => Student, (student) => student.chats)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @OneToMany(() => Message, (message) => message.chat, { cascade: true })
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

