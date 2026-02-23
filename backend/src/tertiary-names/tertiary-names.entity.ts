import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { TutorRequest } from '../tutor-requests/tutor-requests.entity';

@Entity('tertiary_names')
export class TertiaryName {
  @PrimaryColumn({ name: 'unique_id' })
  uniqueId: string;

  @Column({ name: 'tertiary_name', unique: true })
  tertiaryName: string;

  @Column({ name: 'tertiary_codes', nullable: true })
  tertiaryCodes: string;

  @Column({ name: 'tertiary_names_code', nullable: true })
  tertiaryNamesCode: string;

  @CreateDateColumn({ name: 'creation_date' })
  creationDate: Date;

  @UpdateDateColumn({ name: 'modified_date' })
  modifiedDate: Date;

  @Column({ name: 'slug', nullable: true })
  slug: string;

  @Column({ name: 'creator', nullable: true })
  creator: string;

  @OneToMany(() => TutorRequest, (tutorRequest) => tutorRequest.instituteName)
  tutorRequests: TutorRequest[];
}
