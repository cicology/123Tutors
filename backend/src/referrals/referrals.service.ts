import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral, ReferralStatus, ReferralType } from './entities/referral.entity';
import { Tutor } from '../tutors/entities/tutor.entity';

@Injectable()
export class ReferralsService {
  constructor(
    @InjectRepository(Referral)
    private referralRepository: Repository<Referral>,
    @InjectRepository(Tutor)
    private tutorRepository: Repository<Tutor>,
  ) {}

  async generateCode(tutorId: string): Promise<Referral> {
    const code = this.generateReferralCode();
    
    // Check if code already exists
    const existing = await this.referralRepository.findOne({
      where: { referralCode: code },
    });

    if (existing) {
      // If code exists, generate a new one recursively
      return this.generateCode(tutorId);
    }

    const referral = this.referralRepository.create({
      tutorId,
      referralCode: code,
      type: ReferralType.TUTOR,
      status: ReferralStatus.PENDING,
    });

    return this.referralRepository.save(referral);
  }

  async findAll(tutorId: string): Promise<Referral[]> {
    return this.referralRepository.find({
      where: { tutorId },
      relations: ['tutor'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tutorId: string): Promise<Referral> {
    return this.referralRepository.findOne({
      where: { id, tutorId },
    });
  }

  private generateReferralCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Process referral code when a new tutor registers
   * Links the referral code to the email and stores it for later completion
   */
  async processReferralCode(referralCode: string, referredEmail: string): Promise<void> {
    const referral = await this.referralRepository.findOne({
      where: { referralCode, status: ReferralStatus.PENDING },
    });

    if (!referral) {
      // Referral code doesn't exist or is already used - silently continue (don't block registration)
      console.warn(`Invalid or already used referral code: ${referralCode}`);
      return;
    }

    // Link the referral to the email
    referral.referredEmail = referredEmail;
    await this.referralRepository.save(referral);
  }

  /**
   * Complete referral when referred tutor gets approved
   * This should be called when a tutor application is approved
   */
  async completeReferralForEmail(email: string): Promise<void> {
    const referral = await this.referralRepository.findOne({
      where: { referredEmail: email, status: ReferralStatus.PENDING },
    });

    if (!referral) {
      // No referral found for this email - that's okay, just return
      return;
    }

    // Mark referral as completed and set reward
    // Reward amount: R100 per successful tutor referral
    const REWARD_AMOUNT = 100.00;
    
    referral.status = ReferralStatus.COMPLETED;
    referral.reward = REWARD_AMOUNT;
    referral.completedAt = new Date();
    
    await this.referralRepository.save(referral);
    
    // Update tutor's referral count and check for ambassador status
    const tutor = await this.tutorRepository.findOne({ where: { id: referral.tutorId } });
    if (tutor) {
      tutor.tutorReferralsCount = (tutor.tutorReferralsCount || 0) + 1;
      // Award ambassador status if they have at least 1 successful tutor referral
      if (tutor.tutorReferralsCount >= 1 && !tutor.isAmbassador) {
        tutor.isAmbassador = true;
      }
      await this.tutorRepository.save(tutor);
    }
    
    console.log(`Tutor referral completed for tutor ${referral.tutorId}: R${REWARD_AMOUNT} reward`);
  }

  /**
   * Create student referral when tutor refers a request to another tutor
   */
  async createStudentReferral(
    referringTutorId: string,
    requestId: string,
    referredToTutorId: string,
  ): Promise<Referral> {
    const referral = this.referralRepository.create({
      tutorId: referringTutorId,
      type: ReferralType.STUDENT,
      requestId,
      referredToTutorId,
      status: ReferralStatus.PENDING,
    });

    return this.referralRepository.save(referral);
  }

  /**
   * Complete student referral when both student and referred tutor accept
   * Awards R30 to the referring tutor
   */
  async completeStudentReferral(requestId: string): Promise<void> {
    const referral = await this.referralRepository.findOne({
      where: { requestId, status: ReferralStatus.PENDING, type: ReferralType.STUDENT },
    });

    if (!referral) {
      console.warn(`No pending student referral found for request ${requestId}`);
      return;
    }

    // Reward amount: R30 per successful student referral
    const REWARD_AMOUNT = 30.00;
    
    referral.status = ReferralStatus.COMPLETED;
    referral.reward = REWARD_AMOUNT;
    referral.completedAt = new Date();
    
    await this.referralRepository.save(referral);
    console.log(`Student referral completed for tutor ${referral.tutorId}: R${REWARD_AMOUNT} reward`);
  }

  async getReferralStats(tutorId: string) {
    const referrals = await this.findAll(tutorId);
    
    const tutorReferrals = referrals.filter((r) => r.type === ReferralType.TUTOR);
    const studentReferrals = referrals.filter((r) => r.type === ReferralType.STUDENT);
    
    const completed = referrals.filter((r) => r.status === ReferralStatus.COMPLETED);
    const pending = referrals.filter((r) => r.status === ReferralStatus.PENDING);
    
    const totalReward = completed.reduce((sum, r) => sum + Number(r.reward), 0);
    const pendingReward = pending.reduce((sum, r) => sum + Number(r.reward), 0);

    return {
      total: referrals.length,
      tutorReferrals: tutorReferrals.length,
      studentReferrals: studentReferrals.length,
      completed: completed.length,
      pending: pending.length,
      totalReward,
      pendingReward,
    };
  }
}

