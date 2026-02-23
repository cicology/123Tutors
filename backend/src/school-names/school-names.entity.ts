import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { TutorRequest } from '../tutor-requests/tutor-requests.entity';

@Entity('school_names')
export class SchoolName {
  @PrimaryColumn({ name: 'unique_id' })
  uniqueId: string;

  @Column({ name: 'school_type', nullable: true })
  schoolType: string;

  @Column({ name: 'school_names', unique: true })
  schoolNames: string;

  @CreateDateColumn({ name: 'creation_date' })
  creationDate: Date;

  @UpdateDateColumn({ name: 'modified_date' })
  modifiedDate: Date;

  @Column({ name: 'slug', nullable: true })
  slug: string;

  @Column({ name: 'creator', nullable: true })
  creator: string;

  @OneToMany(() => TutorRequest, (tutorRequest) => tutorRequest.schoolName)
  tutorRequests: TutorRequest[];
}
