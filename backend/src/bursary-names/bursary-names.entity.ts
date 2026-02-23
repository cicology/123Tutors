import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BursaryStudent } from '../bursary-students/bursary-students.entity';
import { TutorRequest } from '../tutor-requests/tutor-requests.entity';
import { UserProfile } from '../user-profiles/user-profiles.entity';

@Entity('bursary_names')
export class BursaryName {
  @PrimaryColumn({ name: 'unique_id' })
  uniqueId: string;

  @Column({ name: 'address', type: 'text', nullable: true })
  address: string;

  @Column({ name: 'bursary_name', unique: true })
  bursaryName: string;

  @CreateDateColumn({ name: 'creation_date' })
  creationDate: Date;

  @UpdateDateColumn({ name: 'modified_date' })
  modifiedDate: Date;

  @Column({ name: 'slug', nullable: true })
  slug: string;

  @Column({ name: 'creator', nullable: true })
  creator: string;

  // Extended profile fields
  @Column({ name: 'logo', type: 'text', nullable: true })
  logo: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'email', nullable: true })
  email: string;

  @Column({ name: 'phone', nullable: true })
  phone: string;

  @Column({ name: 'website', nullable: true })
  website: string;

  @Column({ name: 'total_students', type: 'int', default: 0 })
  totalStudents: number;

  @Column({ name: 'total_budget', type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalBudget: number;

  @Column({ name: 'year_established', type: 'int', nullable: true })
  yearEstablished: number;

  @Column({ name: 'programs_offered', type: 'int', default: 0 })
  programsOffered: number;

  @Column({ name: 'primary_color', type: 'varchar', default: '#FF0090' })
  primaryColor: string;

  @Column({ name: 'secondary_color', type: 'varchar', default: '#F8F9FA' })
  secondaryColor: string;

  @OneToMany(() => BursaryStudent, (bursaryStudent) => bursaryStudent.bursaryName)
  bursaryStudents: BursaryStudent[];

  @OneToMany(() => TutorRequest, (tutorRequest) => tutorRequest.bursary)
  tutorRequests: TutorRequest[];

  @OneToMany(() => UserProfile, (userProfile) => userProfile.bursary)
  userProfiles: UserProfile[];
}
