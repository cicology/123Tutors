import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TutorJobNotification } from './tutor-job-notifications.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';
import { TutorRequest } from '../tutor-requests/tutor-requests.entity';
import { UserProfile } from '../user-profiles/user-profiles.entity';

interface TutorCandidate {
  id: string;
  name: string;
  email: string;
  specialization: string;
  experience: string;
  rating: number;
  hourlyRate: number;
  availability: string;
  courses: string[];
  matchScore: number;
}

@Injectable()
export class TutorJobNotificationsService {
  constructor(
    @InjectRepository(TutorJobNotification)
    private readonly tutorJobNotificationsRepository: Repository<TutorJobNotification>,
    @InjectRepository(TutorRequest)
    private readonly tutorRequestRepository: Repository<TutorRequest>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
  ) {}

  private parseTutorMeta(slug?: string): Record<string, any> {
    if (!slug) {
      return {};
    }
    try {
      return JSON.parse(slug);
    } catch {
      return {};
    }
  }

  private normalize(value?: string): string {
    return (value || '').toLowerCase().trim();
  }

  private scoreTutorCandidate(
    tutor: UserProfile,
    criteria: {
      specialization?: string;
      programme?: string;
      university?: string;
      courses?: string[];
      bursaryName?: string;
    },
  ): TutorCandidate {
    const meta = this.parseTutorMeta(tutor.slug);
    const tutorSpecialization = this.normalize(meta.speciality || meta.specialization);
    const tutorAvailability = meta.availability || 'Available';
    const tutorRate = Number(meta.rate || 250);
    const tutorExperienceYears = Number(meta.experienceYears || 0);
    const tutorCourses: string[] = Array.isArray(meta.courses)
      ? meta.courses
      : typeof meta.courses === 'string'
        ? meta.courses.split(',').map((item) => item.trim()).filter(Boolean)
        : [];
    const tutorBursaries: string[] = Array.isArray(meta.bursaries)
      ? meta.bursaries
      : typeof tutor.bursaryName === 'string' && tutor.bursaryName
        ? [tutor.bursaryName]
        : [];

    let score = 40;
    const criteriaSpecialization = this.normalize(criteria.specialization || criteria.programme);
    const criteriaUniversity = this.normalize(criteria.university);
    const criteriaCourses = (criteria.courses || []).map((course) => this.normalize(course));
    const criteriaBursary = this.normalize(criteria.bursaryName);

    if (criteriaSpecialization && tutorSpecialization.includes(criteriaSpecialization)) {
      score += 25;
    }

    if (criteriaUniversity && this.normalize(meta.university).includes(criteriaUniversity)) {
      score += 10;
    }

    const tutorCoursesNormalized = tutorCourses.map((course) => this.normalize(course));
    const matchedCourses = criteriaCourses.filter((course) =>
      tutorCoursesNormalized.some((candidate) => candidate.includes(course) || course.includes(candidate)),
    );
    score += Math.min(20, matchedCourses.length * 7);

    if (
      criteriaBursary &&
      tutorBursaries.some((bursary) => this.normalize(bursary).includes(criteriaBursary))
    ) {
      score += 5;
    }

    score += Math.min(10, tutorExperienceYears * 2);

    return {
      id: tutor.uniqueId,
      name: meta.fullName || tutor.email.split('@')[0],
      email: tutor.email,
      specialization: meta.speciality || meta.specialization || 'General',
      experience: `${tutorExperienceYears || 1} years`,
      rating: Number(meta.rating || 4.5),
      hourlyRate: tutorRate,
      availability: tutorAvailability,
      courses: tutorCourses,
      matchScore: Math.min(score, 100),
    };
  }

  async findTutorCandidates(criteria: {
    specialization?: string;
    programme?: string;
    university?: string;
    courses?: string;
    bursaryName?: string;
  }): Promise<TutorCandidate[]> {
    const tutors = await this.userProfileRepository.find({
      where: { userType: 'tutor' },
      order: { creationDate: 'DESC' },
    });

    const courses = criteria.courses
      ? criteria.courses.split(',').map((course) => course.trim()).filter(Boolean)
      : [];

    return tutors
      .map((tutor) =>
        this.scoreTutorCandidate(tutor, {
          specialization: criteria.specialization,
          programme: criteria.programme,
          university: criteria.university,
          courses,
          bursaryName: criteria.bursaryName,
        }),
      )
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20);
  }

  async createMatchesForRequest(request: TutorRequest): Promise<TutorJobNotification> {
    const candidates = await this.findTutorCandidates({
      specialization: request.instituteSpecialization,
      programme: request.instituteProgramme,
      university: request.instituteName,
      courses: request.requestCourses,
      bursaryName: request.bursaryName,
    });

    const notification = this.tutorJobNotificationsRepository.create({
      uniqueId: `TJN_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      requestUniqueId: request.uniqueId,
      source: 'smart-matching-v1',
      tutorUniqueIdList: candidates.map((candidate) => candidate.id).join(','),
      matchScoreList: JSON.stringify(
        candidates.map((candidate) => ({
          tutorId: candidate.id,
          score: candidate.matchScore,
        })),
      ),
      creator: 'system',
      slug: request.slug,
    });

    await this.tutorJobNotificationsRepository.save(notification);

    return notification;
  }

  async createMatchesForRequestId(requestUniqueId: string): Promise<TutorJobNotification> {
    const request = await this.tutorRequestRepository.findOne({
      where: { uniqueId: requestUniqueId },
    });

    if (!request) {
      throw new NotFoundException(`Tutor request with ID ${requestUniqueId} was not found`);
    }

    return await this.createMatchesForRequest(request);
  }

  async findAll(paginationDto: PaginationDto, searchDto: SearchDto): Promise<{ data: TutorJobNotification[]; total: number }> {
    const { page, limit } = paginationDto;
    const { search, sortBy, sortOrder } = searchDto;

    const queryBuilder = this.tutorJobNotificationsRepository.createQueryBuilder('tutorJobNotifications');

    if (search) {
      queryBuilder.where(
        'tutorJobNotifications.uniqueId ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      queryBuilder.orderBy(`tutorJobNotifications.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('tutorJobNotifications.creationDate', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(uniqueId: string): Promise<TutorJobNotification> {
    const tutorJobNotifications = await this.tutorJobNotificationsRepository.findOne({
      where: { uniqueId },
    });

    if (!tutorJobNotifications) {
      throw new NotFoundException(`TutorJobNotification with unique ID ${uniqueId} not found`);
    }

    return tutorJobNotifications;
  }
}
