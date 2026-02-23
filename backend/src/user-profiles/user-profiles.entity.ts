import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BursaryName } from '../bursary-names/bursary-names.entity';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryColumn({ name: 'email' })
  email: string;

  @Column({ name: 'user_type', default: 'user' })
  userType: string;

  @Column({ name: 'bursary_name', nullable: true })
  bursaryName: string;

  @CreateDateColumn({ name: 'creation_date' })
  creationDate: Date;

  @UpdateDateColumn({ name: 'modified_date' })
  modifiedDate: Date;

  @Column({ name: 'slug', nullable: true })
  slug: string;

  @Column({ name: 'creator', nullable: true })
  creator: string;

  @Column({ name: 'unique_id', unique: true })
  uniqueId: string;

  @Column({ name: 'profile_image_url', nullable: true })
  profileImageUrl: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  // Relationship to BursaryName
  @ManyToOne(() => BursaryName, (bursaryName) => bursaryName.userProfiles, { nullable: true })
  @JoinColumn({ name: 'bursary_name', referencedColumnName: 'bursaryName' })
  bursary: BursaryName;
}
