import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tertiary_specializations')
export class TertiarySpecialization {
  @PrimaryColumn({ name: 'unique_id' })
  uniqueId: string;

  @Column({ name: 'tertiary_specialization' })
  tertiarySpecialization: string;

  @CreateDateColumn({ name: 'creation_date' })
  creationDate: Date;

  @UpdateDateColumn({ name: 'modified_date' })
  modifiedDate: Date;

  @Column({ name: 'slug', nullable: true })
  slug: string;

  @Column({ name: 'creator', nullable: true })
  creator: string;
}
