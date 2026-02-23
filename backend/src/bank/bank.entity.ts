import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('bank')
export class Bank {
  @PrimaryColumn({ name: 'unique_id' })
  uniqueId: string;

  @Column({ name: 'bank_name', nullable: true })
  bankName: string;

  @Column({ name: 'branch_code', nullable: true })
  branchCode: string;

  @CreateDateColumn({ name: 'creation_date' })
  creationDate: Date;

  @UpdateDateColumn({ name: 'modified_date' })
  modifiedDate: Date;

  @Column({ name: 'slug', nullable: true })
  slug: string;

  @Column({ name: 'creator', nullable: true })
  creator: string;
}
