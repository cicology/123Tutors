import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TutorRequest } from '../tutor-requests/tutor-requests.entity';

@Entity('tutor_job_notifications')
export class TutorJobNotification {
  @PrimaryColumn({ name: 'unique_id' })
  uniqueId: string;

  @Column({ name: 'match_score_list', type: 'text', nullable: true })
  matchScoreList: string;

  @Column({ name: 'request_unique_id' })
  requestUniqueId: string;

  @Column({ name: 'source', nullable: true })
  source: string;

  @Column({ name: 'tutor_unique_id_list', type: 'text', nullable: true })
  tutorUniqueIdList: string;

  @CreateDateColumn({ name: 'creation_date' })
  creationDate: Date;

  @UpdateDateColumn({ name: 'modified_date' })
  modifiedDate: Date;

  @Column({ name: 'slug', nullable: true })
  slug: string;

  @Column({ name: 'creator', nullable: true })
  creator: string;

  @ManyToOne(() => TutorRequest, (tutorRequest) => tutorRequest.tutorJobNotifications)
  @JoinColumn({ name: 'request_unique_id', referencedColumnName: 'uniqueId' })
  request: TutorRequest;
}
