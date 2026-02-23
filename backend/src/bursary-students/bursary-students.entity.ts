import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BursaryName } from '../bursary-names/bursary-names.entity';

@Entity('bursary_students')
export class BursaryStudent {
  @PrimaryColumn({ name: 'unique_id' })
  uniqueId: string;

  @Column({ name: 'bursary' })
  bursary: string;

  @Column({ name: 'student_email' })
  studentEmail: string;

  @Column({ name: 'student_name_and_surname' })
  studentNameAndSurname: string;

  @Column({ name: 'student_disallowed', type: 'boolean', default: false })
  studentDisallowed: boolean;

  @Column({ name: 'year', type: 'int', nullable: true })
  year: number;

  @Column({ name: 'university', nullable: true })
  university: string;

  @Column({ name: 'course', nullable: true })
  course: string;

  @Column({ name: 'student_id_number', nullable: true })
  studentIdNumber: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ name: 'address', nullable: true })
  address: string;

  @Column({ name: 'enrollment_date', type: 'date', nullable: true })
  enrollmentDate: Date;

  @Column({ name: 'status', nullable: true })
  status: string;

  @Column({ name: 'budget', type: 'decimal', precision: 10, scale: 2, nullable: true })
  budget: number;

  @CreateDateColumn({ name: 'creation_date' })
  creationDate: Date;

  @UpdateDateColumn({ name: 'modified_date' })
  modifiedDate: Date;

  @Column({ name: 'slug', nullable: true })
  slug: string;

  @Column({ name: 'creator', nullable: true })
  creator: string;

  @ManyToOne(() => BursaryName, (bursaryName) => bursaryName.bursaryStudents)
  @JoinColumn({ name: 'bursary', referencedColumnName: 'bursaryName' })
  bursaryName: BursaryName;
}
