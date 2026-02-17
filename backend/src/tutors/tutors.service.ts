import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { Tutor } from './entities/tutor.entity';
import { Course } from '../courses/entities/course.entity';
import { TutorApplication } from './entities/tutor-application.entity';
import { CreateTutorDto } from '../auth/dto/create-tutor.dto';
import { TutorStatus } from './entities/tutor.entity';
import { ApplicationStatus } from './entities/tutor-application.entity';
import { CourseRequest, RequestStatus } from '../requests/entities/course-request.entity';
import { Lesson, LessonStatus } from '../lessons/entities/lesson.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Message } from '../chats/entities/message.entity';
import { Chat } from '../chats/entities/chat.entity';
import { Student } from '../auth/entities/student.entity';
import { ApplyTutorDto } from './dto/apply-tutor.dto';

@Injectable()
export class TutorsService {
  constructor(
    @InjectRepository(Tutor)
    private tutorRepository: Repository<Tutor>,
    @InjectRepository(TutorApplication)
    private applicationRepository: Repository<TutorApplication>,
    @InjectRepository(CourseRequest)
    private requestRepository: Repository<CourseRequest>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  async create(createTutorDto: CreateTutorDto): Promise<Tutor> {
    const tutor = this.tutorRepository.create({
      ...createTutorDto,
      status: TutorStatus.PENDING,
    });

    const savedTutor = await this.tutorRepository.save(tutor);

    // Create application automatically
    const application = this.applicationRepository.create({
      tutorId: savedTutor.id,
      status: ApplicationStatus.PENDING,
    });
    await this.applicationRepository.save(application);

    return savedTutor;
  }

  async applyFromStudent(studentId: string, applyDto: ApplyTutorDto): Promise<Tutor> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    const existingTutor = await this.tutorRepository.findOne({
      where: { email: student.email },
    });

    if (existingTutor) {
      throw new ConflictException('You already have a tutor application associated with this email');
    }

    const tutor = this.tutorRepository.create({
      email: student.email,
      password: student.password, // Reuse hashed password so the same credentials work
      firstName: applyDto.firstName || student.firstName || 'Tutor',
      lastName: applyDto.lastName || student.lastName || '',
      phone: applyDto.phone || student.phone,
      location: applyDto.location || student.location,
      subjects: applyDto.subjects || '',
      qualifications: applyDto.qualifications || '',
      experience: applyDto.experience || '',
      status: TutorStatus.PENDING,
    });

    const savedTutor = await this.tutorRepository.save(tutor);

    const application = this.applicationRepository.create({
      tutorId: savedTutor.id,
      status: ApplicationStatus.PENDING,
    });
    await this.applicationRepository.save(application);

    return savedTutor;
  }

  async findAll(): Promise<Tutor[]> {
    return this.tutorRepository.find({
      relations: ['application', 'courses', 'lessons', 'reviews'],
    });
  }

  async findOne(id: string): Promise<Tutor> {
    const tutor = await this.tutorRepository.findOne({
      where: { id },
      relations: ['application', 'courses', 'lessons', 'reviews', 'payments'],
    });

    if (!tutor) {
      throw new NotFoundException('Tutor not found');
    }

    return tutor;
  }

  async findByEmail(email: string): Promise<Tutor | null> {
    return this.tutorRepository.findOne({
      where: { email },
      relations: ['application'],
    });
  }

  private normalizeList(value?: string | null): string[] {
    if (!value) {
      return [];
    }

    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch (e) {
      // Not JSON, fall back to comma/newline separation
    }

    return value
      .split(/,|\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private calculateAverageRate(lessons?: Lesson[]): number {
    if (!lessons || lessons.length === 0) {
      return 300;
    }

    const rates = lessons
      .map((lesson) => Number(lesson.hourlyRate))
      .filter((rate) => !Number.isNaN(rate) && rate > 0);

    if (rates.length === 0) {
      return 300;
    }

    const average = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    return Math.round(average);
  }

  private deriveModes(tutor: Tutor): string[] {
    const modes = new Set<string>();
    if (tutor.location) {
      modes.add('In-person');
    }
    modes.add('Online');
    return Array.from(modes);
  }

  private deriveHighlights(tutor: Tutor): string[] {
    const highlights = [];
    if (tutor.qualifications) {
      const qualification = tutor.qualifications.split('\n')[0].trim();
      if (qualification) {
        highlights.push(qualification);
      }
    }
    if (tutor.experience) {
      const experienceLine = tutor.experience.split('\n')[0].trim();
      if (experienceLine) {
        highlights.push(experienceLine);
      }
    }
    return highlights.slice(0, 3);
  }

  private deriveLevels(courses: Course[]): string[] {
    const levels = new Set<string>();
    courses.forEach((course) => {
      if (course.level) {
        levels.add(course.level);
      }
    });
    return Array.from(levels);
  }

  async getMarketplaceTutors() {
    const tutors = await this.tutorRepository.find({
      where: { status: TutorStatus.APPROVED },
      relations: ['courses', 'reviews', 'lessons'],
    });

    return tutors.map((tutor) => {
      const courses = (tutor.courses || [])
        .filter((course) => course.isActive !== false)
        .map((course) => ({
          id: course.id,
          name: course.name,
          subject: course.subject,
          level: course.level,
          description: course.description,
          lessonsOffered: [1, 4, 8, 12],
        }));

      return {
        id: tutor.id,
        firstName: tutor.firstName,
        lastName: tutor.lastName,
        name: `${tutor.firstName || ''} ${tutor.lastName || ''}`.trim() || tutor.email,
        rating: Number(tutor.rating) || 0,
        reviews: tutor.reviews?.length || 0,
        hourlyRate: this.calculateAverageRate(tutor.lessons),
        experienceYears: tutor.firstLessonDate
          ? Math.max(
              1,
              new Date().getFullYear() - tutor.firstLessonDate.getFullYear(),
            )
          : undefined,
        location: tutor.location || 'Remote',
        mode: this.deriveModes(tutor),
        levelFocus: this.deriveLevels(tutor.courses || []),
        subjects: this.normalizeList(tutor.subjects),
        courses,
        bio: tutor.experience || tutor.qualifications || '',
        highlights: this.deriveHighlights(tutor),
        availability: tutor.experience
          ? 'Flexible schedule • Shared after booking'
          : 'Flexible availability',
        profilePicture: tutor.profilePicture || null,
      };
    });
  }

  async getDashboardData(tutorId: string) {
    const tutor = await this.findOne(tutorId);
    
    // Determine application status - check tutor status first, then application status
    // Convert TutorStatus enum to ApplicationStatus enum for consistency
    let applicationStatus: ApplicationStatus = ApplicationStatus.PENDING;
    
    // Priority: tutor.status (which reflects actual approval) > application.status
    if (tutor.status === TutorStatus.APPROVED) {
      applicationStatus = ApplicationStatus.APPROVED;
    } else if (tutor.status === TutorStatus.REJECTED) {
      applicationStatus = ApplicationStatus.REJECTED;
    } else if (tutor.application?.status) {
      // Only use application status if tutor status is still PENDING
      applicationStatus = tutor.application.status;
    }
    
    const sanitizedTutor = this.sanitizeTutor(tutor);
    
    // Ensure firstName, lastName, and isAmbassador are included in response
    const tutorResponse = {
      ...sanitizedTutor,
      firstName: tutor.firstName,
      lastName: tutor.lastName,
      email: tutor.email,
      isAmbassador: tutor.isAmbassador || false,
    };
    
    // Get start and end of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // Calculate active students (students that tutor offers courses to)
    // Include students with accepted course requests AND students with scheduled lessons
    const acceptedRequests = await this.requestRepository.find({
      where: {
        tutorId,
        status: RequestStatus.ACCEPTED,
      },
    });
    const activeStudentIds = new Set(acceptedRequests.map(req => req.studentId));
    
    // Also include students who have scheduled lessons with this tutor
    const scheduledLessons = await this.lessonRepository.find({
      where: {
        tutorId,
        status: LessonStatus.SCHEDULED,
      },
      select: ['studentId'],
    });
    scheduledLessons.forEach(lesson => {
      if (lesson.studentId) {
        activeStudentIds.add(lesson.studentId);
      }
    });
    
    const activeStudentsCount = activeStudentIds.size;
    
    // Calculate this month's earnings (from completed payments paid this month)
    const thisMonthPayments = await this.paymentRepository.find({
      where: {
        tutorId,
        status: PaymentStatus.COMPLETED,
        paidAt: Between(startOfMonth, endOfMonth),
      },
    });
    const thisMonthEarnings = thisMonthPayments.reduce(
      (sum, payment) => sum + Number(payment.tutorAmount || payment.amount || 0),
      0
    );
    
    // Calculate this month's scheduled lessons (lessons scheduled within the current month)
    const thisMonthLessons = await this.lessonRepository.count({
      where: {
        tutorId,
        status: LessonStatus.SCHEDULED,
        scheduledAt: Between(startOfMonth, endOfMonth),
      },
    });
    
    // Calculate incoming messages from students this month
    const tutorChats = await this.chatRepository.find({
      where: { tutorId },
    });
    const chatIds = tutorChats.map(chat => chat.id);
    
    // Only count messages if tutor has chats (messages created this month)
    let thisMonthMessages = 0;
    if (chatIds.length > 0) {
      thisMonthMessages = await this.messageRepository.count({
        where: {
          chatId: In(chatIds),
          senderType: 'student',
          createdAt: Between(startOfMonth, endOfMonth),
        },
      });
    }
    
    console.log('Dashboard data - Tutor status:', tutor.status);
    console.log('Dashboard data - Application status:', tutor.application?.status);
    console.log('Dashboard data - Final applicationStatus:', applicationStatus);
    console.log('Dashboard data - Tutor firstName:', tutor.firstName, 'lastName:', tutor.lastName);
    console.log('Dashboard data - Active students:', activeStudentsCount);
    console.log('Dashboard data - This month earnings:', thisMonthEarnings);
    console.log('Dashboard data - This month lessons:', thisMonthLessons);
    console.log('Dashboard data - This month messages:', thisMonthMessages);
    
    return {
      tutor: tutorResponse,
      applicationStatus: applicationStatus,
      stats: {
        totalSessions: tutor.totalSessions,
        totalStudents: activeStudentsCount, // Active students with accepted requests
        rating: tutor.rating,
        totalCourses: tutor.courses?.length || 0,
        thisMonthEarnings: thisMonthEarnings,
        thisMonthSessions: thisMonthLessons,
        thisMonthMessages: thisMonthMessages,
      },
    };
  }

  async update(id: string, updateTutorDto: any): Promise<Tutor> {
    const tutor = await this.findOne(id);
    Object.assign(tutor, updateTutorDto);
    return this.tutorRepository.save(tutor);
  }

  sanitizeTutor(tutor: Tutor): Partial<Tutor> {
    const { password, ...sanitized } = tutor;
    // Explicitly ensure firstName and lastName are included
    return {
      ...sanitized,
      firstName: tutor.firstName,
      lastName: tutor.lastName,
      email: tutor.email,
    };
  }
}

