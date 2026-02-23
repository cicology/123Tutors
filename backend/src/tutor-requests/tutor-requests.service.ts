import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TutorRequest } from './tutor-requests.entity';
import { CreateTutorRequestDto } from './dto/create-tutor-request.dto';
import { UpdateTutorRequestDto } from './dto/update-tutor-request.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';
import { BursaryStudent } from '../bursary-students/bursary-students.entity';
import { TutorJobNotificationsService } from '../tutor-job-notifications/tutor-job-notifications.service';

@Injectable()
export class TutorRequestsService {
  constructor(
    @InjectRepository(TutorRequest)
    private readonly tutorRequestRepository: Repository<TutorRequest>,
    @InjectRepository(BursaryStudent)
    private readonly bursaryStudentRepository: Repository<BursaryStudent>,
    private readonly tutorJobNotificationsService: TutorJobNotificationsService,
  ) {}

  async create(createTutorRequestDto: CreateTutorRequestDto): Promise<TutorRequest> {
    // Validate tutoring start period is not in the past
    if (createTutorRequestDto.tutoringStartPeriod) {
      const startDate = new Date(createTutorRequestDto.tutoringStartPeriod);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        throw new BadRequestException('Tutoring start date cannot be in the past');
      }
    }

    // Validate student exists and belongs to the specified bursary
    if (createTutorRequestDto.bursaryName && createTutorRequestDto.studentEmail) {
      const student = await this.bursaryStudentRepository.findOne({
        where: {
          studentEmail: createTutorRequestDto.studentEmail,
          bursary: createTutorRequestDto.bursaryName,
          studentDisallowed: false,
        },
      });

      if (!student) {
        throw new BadRequestException(
          `Student with email ${createTutorRequestDto.studentEmail} does not exist or does not belong to bursary ${createTutorRequestDto.bursaryName}`
        );
      }

      // Check if student is disabled
      if (student.studentDisallowed || student.status === 'disabled') {
        throw new BadRequestException(
          `Student with email ${createTutorRequestDto.studentEmail} is disabled and cannot receive tutor requests`
        );
      }
    }

    // Generate unique ID
    const uniqueId = `TR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate slug from student email
    const slug = createTutorRequestDto.studentEmail.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Create tutor request with generated fields
    const tutorRequest = this.tutorRequestRepository.create({
      ...createTutorRequestDto,
      uniqueId,
      slug,
      creator: 'system',
      bursaryClientRequestAutoApproved: false,
      contactedSalesBoolean: false,
      refunded: false,
      installmentPayment: false,
      installment1Paid: false,
      installment2Paid: false,
      installment3Paid: false,
      installmentPaidUp: false,
      newSystemRequest: false,
      notInterested: false,
      requestDelete: false,
      promoCodeValid: false,
      swapout: false,
    });
    
    const savedTutorRequest = await this.tutorRequestRepository.save(tutorRequest);

    // Fire-and-forget smart matching. Request creation should not fail if matching fails.
    this.tutorJobNotificationsService
      .createMatchesForRequest(savedTutorRequest)
      .catch(() => undefined);

    return savedTutorRequest;
  }

  async findAll(paginationDto: PaginationDto, searchDto: SearchDto): Promise<{ data: TutorRequest[]; total: number }> {
    const { page, limit } = paginationDto;
    const { search, sortBy, sortOrder } = searchDto;

    const queryBuilder = this.tutorRequestRepository.createQueryBuilder('tutorRequest')
      .leftJoinAndSelect('tutorRequest.institute', 'institute')
      .leftJoinAndSelect('tutorRequest.school', 'school')
      .leftJoinAndSelect('tutorRequest.bursary', 'bursary')
      .leftJoinAndSelect('tutorRequest.promoCodeEntity', 'promoCode');

    if (search) {
      queryBuilder.where(
        'tutorRequest.studentEmail ILIKE :search OR tutorRequest.studentFirstName ILIKE :search OR tutorRequest.studentLastName ILIKE :search OR tutorRequest.bursaryName ILIKE :search OR tutorRequest.instituteName ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      queryBuilder.orderBy(`tutorRequest.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('tutorRequest.creationDate', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(uniqueId: string): Promise<TutorRequest> {
    const tutorRequest = await this.tutorRequestRepository.findOne({
      where: { uniqueId },
      relations: ['institute', 'school', 'bursary', 'promoCodeEntity', 'tutorSessionsOrders', 'studentLessons'],
    });

    if (!tutorRequest) {
      throw new NotFoundException(`Tutor request with unique ID ${uniqueId} not found`);
    }

    return tutorRequest;
  }

  async findByStudentEmail(studentEmail: string): Promise<TutorRequest[]> {
    return await this.tutorRequestRepository.find({
      where: { studentEmail },
      relations: ['institute', 'school', 'bursary', 'promoCodeEntity'],
      order: { creationDate: 'DESC' },
    });
  }

  async findByBursaryName(bursaryName: string): Promise<TutorRequest[]> {
    return await this.tutorRequestRepository.find({
      where: { bursaryName },
      relations: ['institute', 'school', 'bursary', 'promoCodeEntity'],
      order: { creationDate: 'DESC' },
    });
  }

  async update(uniqueId: string, updateTutorRequestDto: UpdateTutorRequestDto): Promise<TutorRequest> {
    const tutorRequest = await this.findOne(uniqueId);
    
    Object.assign(tutorRequest, updateTutorRequestDto);
    return await this.tutorRequestRepository.save(tutorRequest);
  }

  async remove(uniqueId: string): Promise<void> {
    const tutorRequest = await this.findOne(uniqueId);
    await this.tutorRequestRepository.remove(tutorRequest);
  }

  async approveRequest(uniqueId: string): Promise<TutorRequest> {
    const tutorRequest = await this.findOne(uniqueId);
    tutorRequest.paid = true;
    tutorRequest.paidDate = new Date();
    // If the request was previously rejected, reset the rejection status
    if (tutorRequest.notInterested) {
      tutorRequest.notInterested = false;
      tutorRequest.notInterestedComments = null;
    }
    return await this.tutorRequestRepository.save(tutorRequest);
  }

  async rejectRequest(uniqueId: string, reason?: string): Promise<TutorRequest> {
    const tutorRequest = await this.findOne(uniqueId);
    tutorRequest.notInterested = true;
    tutorRequest.notInterestedComments = reason;
    // If the request was previously approved, reset the approval status
    if (tutorRequest.paid) {
      tutorRequest.paid = false;
      tutorRequest.paidDate = null;
    }
    return await this.tutorRequestRepository.save(tutorRequest);
  }

  async getRequestStats(): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    totalAmount: number;
    paidAmount: number;
  }> {
    const totalRequests = await this.tutorRequestRepository.count();
    const pendingRequests = await this.tutorRequestRepository.count({
      where: { paid: false, notInterested: false, requestDelete: false }
    });
    const approvedRequests = await this.tutorRequestRepository.count({
      where: { paid: true }
    });
    const rejectedRequests = await this.tutorRequestRepository.count({
      where: { notInterested: true }
    });

    const totalAmountResult = await this.tutorRequestRepository
      .createQueryBuilder('tutorRequest')
      .select('SUM(tutorRequest.totalAmount)', 'total')
      .getRawOne();

    const paidAmountResult = await this.tutorRequestRepository
      .createQueryBuilder('tutorRequest')
      .select('SUM(tutorRequest.totalAmount)', 'total')
      .where('tutorRequest.paid = :paid', { paid: true })
      .getRawOne();

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      totalAmount: parseFloat(totalAmountResult?.total || '0'),
      paidAmount: parseFloat(paidAmountResult?.total || '0'),
    };
  }

  async getRequestsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<TutorRequest[]> {
    let whereCondition: any = {};

    switch (status) {
      case 'pending':
        whereCondition = { paid: false, notInterested: false, requestDelete: false };
        break;
      case 'approved':
        whereCondition = { paid: true };
        break;
      case 'rejected':
        whereCondition = { notInterested: true };
        break;
    }

    return await this.tutorRequestRepository.find({
      where: whereCondition,
      relations: ['institute', 'school', 'bursary', 'promoCodeEntity'],
      order: { creationDate: 'DESC' },
    });
  }
}
