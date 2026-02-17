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

export enum ReferralStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

export enum ReferralType {
  TUTOR = 'tutor', // Tutor refers another tutor to join
  STUDENT = 'student', // Tutor refers student request to another tutor
}

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tutorId: string; // The tutor who made the referral

  @ManyToOne(() => Tutor, (tutor) => tutor.referrals)
  @JoinColumn({ name: 'tutorId' })
  tutor: Tutor;

  @Column({
    type: 'enum',
    enum: ReferralType,
    default: ReferralType.TUTOR,
  })
  type: ReferralType;

  @Column({ nullable: true })
  referralCode: string; // For tutor referrals

  @Column({ nullable: true })
  referredEmail: string; // For tutor referrals

  @Column({ nullable: true })
  requestId: string; // For student referrals - link to course request

  @Column({ nullable: true })
  referredToTutorId: string; // For student referrals - the tutor the request was referred to

  @Column({
    type: 'enum',
    enum: ReferralStatus,
    default: ReferralStatus.PENDING,
  })
  status: ReferralStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  reward: number;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

