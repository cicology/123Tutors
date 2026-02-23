import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { TutorRequest } from '../tutor-requests/tutor-requests.entity';
import { TutorSessionsOrder } from '../tutor-sessions-orders/tutor-sessions-orders.entity';

@Entity('promo_codes')
export class PromoCode {
  @PrimaryColumn({ name: 'unique_id' })
  uniqueId: string;

  @Column({ name: 'discount', type: 'decimal', precision: 5, scale: 2, nullable: true })
  discount: number;

  @Column({ name: 'promo_code', unique: true })
  promoCode: string;

  @Column({ name: 'source', nullable: true })
  source: string;

  @Column({ name: 'use_number', type: 'int', nullable: true })
  useNumber: number;

  @Column({ name: 'voucher_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  voucherAmount: number;

  @CreateDateColumn({ name: 'creation_date' })
  creationDate: Date;

  @UpdateDateColumn({ name: 'modified_date' })
  modifiedDate: Date;

  @Column({ name: 'slug', nullable: true })
  slug: string;

  @Column({ name: 'creator', nullable: true })
  creator: string;

  @OneToMany(() => TutorRequest, (tutorRequest) => tutorRequest.promoCode)
  tutorRequests: TutorRequest[];

  @OneToMany(() => TutorSessionsOrder, (tutorSessionsOrder) => tutorSessionsOrder.promoCode)
  tutorSessionsOrders: TutorSessionsOrder[];
}
