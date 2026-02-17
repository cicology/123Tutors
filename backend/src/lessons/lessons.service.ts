import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Lesson, LessonStatus, LessonType } from './entities/lesson.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { CourseRequest } from '../requests/entities/course-request.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentsService } from '../payments/payments.service';
import { Student } from '../auth/entities/student.entity';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(CourseRequest)
    private requestRepository: Repository<CourseRequest>,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
  ) {}

  async create(tutorId: string, createLessonDto: CreateLessonDto): Promise<Lesson> {
    // Validate student
    const studentRepository = this.lessonRepository.manager.getRepository(Student);
    const student = await studentRepository.findOne({
      where: { id: createLessonDto.studentId },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    // Enforce weekly/weekday scheduling rules
    const existingLessons = await this.lessonRepository.find({
      where: { studentId: createLessonDto.studentId, status: LessonStatus.SCHEDULED },
      order: { scheduledAt: 'ASC' },
    });

    const scheduledAt = new Date(createLessonDto.scheduledAt);
    const dayOfWeek = scheduledAt.getDay();

    if (dayOfWeek !== 6) {
      const weekKey = this.getWeekKey(scheduledAt);
      const thisWeekLessons = existingLessons.filter((lesson) => {
        const lessonDate = new Date(lesson.scheduledAt);
        const lessonWeekKey = this.getWeekKey(lessonDate);
        return lessonWeekKey === weekKey && lessonDate.getDay() !== 6;
      });

      if (thisWeekLessons.length >= 2) {
        throw new BadRequestException(
          'Weekday students can have maximum 2 sessions per week. This student already has 2 sessions scheduled this week.',
        );
      }
    }

    let totalAmount = createLessonDto.totalAmount ? Number(createLessonDto.totalAmount) : null;
    let hourlyRate = createLessonDto.hourlyRate ? Number(createLessonDto.hourlyRate) : null;

    // If lesson is tied to a course request, inherit pricing information
    if (createLessonDto.requestId) {
      const request = await this.requestRepository.findOne({
        where: { id: createLessonDto.requestId },
      });

      if (!request) {
        throw new BadRequestException('Tutor request not found');
      }
      if (request.tutorId !== tutorId) {
        throw new ForbiddenException('This request does not belong to you');
      }
      if (request.studentId !== createLessonDto.studentId) {
        throw new BadRequestException('Student does not match the original tutor request');
      }

      if (request.totalPrice) {
        const lessonsCount = request.lessonCount && request.lessonCount > 0 ? request.lessonCount : 1;
        const perLessonAmount = Number(request.totalPrice) / lessonsCount;
        totalAmount = perLessonAmount;

        const durationMinutes = createLessonDto.duration || request.lessonDuration || 60;
        if (durationMinutes > 0) {
          hourlyRate = perLessonAmount / (durationMinutes / 60);
        }
      }
    }

    const lesson = this.lessonRepository.create({
      studentId: createLessonDto.studentId,
      courseId: createLessonDto.courseId,
      subject: createLessonDto.subject,
      scheduledAt: scheduledAt,
      duration: createLessonDto.duration,
      type: createLessonDto.type,
      notes: createLessonDto.notes,
      tutorId,
      requestId: createLessonDto.requestId,
      hourlyRate: hourlyRate !== null ? Number(hourlyRate.toFixed(2)) : null,
      totalAmount: totalAmount !== null ? Number(totalAmount.toFixed(2)) : null,
    });

    const savedLesson = await this.lessonRepository.save(lesson);

    try {
      const scheduledText = savedLesson.scheduledAt.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      await this.notificationsService.create({
        type: 'session_scheduled' as any,
        recipientType: 'student' as any,
        studentId: savedLesson.studentId,
        title: 'Lesson Scheduled',
        message: `Your tutor scheduled ${savedLesson.subject} on ${scheduledText}.`,
        requestId: savedLesson.requestId || null,
      });
    } catch (error) {
      console.error('Failed to create session_scheduled notification:', error);
    }

    return savedLesson;
  }

  async findAll(tutorId: string): Promise<Lesson[]> {
    console.log(`LessonsService.findAll - Finding lessons for tutor: ${tutorId}`);
    
    const lessons = await this.lessonRepository.find({
      where: { tutorId },
      relations: ['student', 'course'],
      order: { scheduledAt: 'ASC' },
    });
    
    // Load request data for lessons that have requestId
    const lessonsWithRequests = await Promise.all(lessons.map(async (lesson) => {
      if (lesson.requestId) {
        const request = await this.requestRepository.findOne({
          where: { id: lesson.requestId },
          relations: ['course'],
        });
        return {
          ...lesson,
          request: request ? {
            id: request.id,
            preferredSchedule: request.preferredSchedule,
            lessonCount: request.lessonCount,
            lessonDuration: request.lessonDuration,
            totalPrice: request.totalPrice,
            message: request.message,
            notes: request.notes,
            createdAt: request.createdAt,
          } : null,
        };
      }
      return lesson;
    }));
    
    console.log(`Found ${lessonsWithRequests.length} lessons for tutor ${tutorId}`);
    console.log(`Lesson studentIds:`, lessonsWithRequests.map(l => ({ id: l.id, studentId: l.studentId, studentName: l.student?.firstName + ' ' + l.student?.lastName, scheduledAt: l.scheduledAt, status: l.status })));
    
    return lessonsWithRequests as any;
  }

  async findUpcoming(tutorId: string): Promise<Lesson[]> {
    const now = new Date();
    return this.lessonRepository.find({
      where: {
        tutorId,
        status: LessonStatus.SCHEDULED,
      },
      relations: ['student', 'course'],
      order: { scheduledAt: 'ASC' },
    });
  }

  async findOne(id: string, tutorId: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['student', 'course', 'review'],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (tutorId && lesson.tutorId !== tutorId) {
      throw new ForbiddenException('You do not have access to this lesson');
    }

    return lesson;
  }

  async findOneForStudent(id: string, studentId: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id, studentId },
      relations: ['tutor', 'course', 'review'],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async update(id: string, tutorId: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.findOne(id, tutorId);
    const wasCompleted = lesson.status === LessonStatus.COMPLETED;

    if (updateLessonDto.scheduledAt) {
      lesson.scheduledAt = new Date(updateLessonDto.scheduledAt);
    }

    if (updateLessonDto.status) {
      lesson.status = updateLessonDto.status as LessonStatus;
    }

    const becameCompleted =
      !wasCompleted && lesson.status === LessonStatus.COMPLETED;

    if (lesson.status === LessonStatus.COMPLETED) {
      lesson.completedAt = lesson.completedAt ?? new Date();
      if (!lesson.startedAt) {
        lesson.startedAt = lesson.scheduledAt;
      }
      if (!lesson.endedAt) {
        lesson.endedAt = new Date();
      }
      if (
        lesson.actualDuration === null ||
        lesson.actualDuration === undefined
      ) {
        const durationMinutes = updateLessonDto.duration ?? lesson.duration ?? 60;
        lesson.actualDuration = durationMinutes;
      }
    }

    Object.assign(lesson, updateLessonDto);
    const savedLesson = await this.lessonRepository.save(lesson);

    if (becameCompleted) {
      try {
        await this.paymentsService.createPaymentFromSession(savedLesson.id);
      } catch (error) {
        console.error('Error creating payment for session:', error);
      }
    }

    return savedLesson;
  }

  async remove(id: string, tutorId: string): Promise<void> {
    const lesson = await this.findOne(id, tutorId);
    await this.lessonRepository.remove(lesson);
  }

  /**
   * Generate lessons from accepted course request preferred schedule
   */
  async generateLessonsFromRequest(requestId: string): Promise<Lesson[]> {
    console.log(`[generateLessonsFromRequest] Starting for requestId: ${requestId}`);
    
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['course', 'student'],
    });

    if (!request) {
      console.error(`[generateLessonsFromRequest] Request not found: ${requestId}`);
      throw new BadRequestException('Request not found');
    }

    // Check status - handle both enum and string
    const statusStr = String(request.status || '').toLowerCase();
    if (statusStr !== 'accepted') {
      console.error(`[generateLessonsFromRequest] Request not accepted. Status: ${request.status} (normalized: ${statusStr})`);
      throw new BadRequestException(`Request not accepted. Current status: ${request.status}`);
    }

    console.log(`[generateLessonsFromRequest] Request found and accepted. Student: ${request.student?.firstName} ${request.student?.lastName}, Course: ${request.course?.name}`);

    let scheduleData: any;
    try {
      scheduleData = typeof request.preferredSchedule === 'string'
        ? JSON.parse(request.preferredSchedule)
        : request.preferredSchedule;
      console.log(`[generateLessonsFromRequest] Schedule data parsed:`, scheduleData);
    } catch (error) {
      console.error(`[generateLessonsFromRequest] Failed to parse schedule:`, error);
      throw new BadRequestException('Invalid schedule format');
    }

    const lessons: Lesson[] = [];
    const { days, times, duration, startDate, endDate, frequency = 'weekly', lessonType } = scheduleData;

    // Pre-fetch existing lessons for conflict checking (optimization)
    const existingTutorLessons = await this.lessonRepository.find({
      where: {
        tutorId: request.tutorId,
        status: LessonStatus.SCHEDULED,
      },
    });

    const existingStudentLessons = await this.lessonRepository.find({
      where: {
        studentId: request.studentId,
        status: LessonStatus.SCHEDULED,
      },
    });

    if (!days || !times || !duration) {
      throw new BadRequestException('Schedule must include days, times, and duration');
    }

    const start = new Date(startDate || new Date());
    // Use endDate from schedule, or calculate based on term duration (default to academic term: ~12 weeks)
    let end: Date;
    if (endDate) {
      end = new Date(endDate);
    } else if (scheduleData.termDuration) {
      // termDuration should be in weeks
      const weeks = parseInt(scheduleData.termDuration) || 12;
      end = new Date(start);
      end.setDate(end.getDate() + (weeks * 7));
    } else {
      // Default to 12 weeks (one academic term)
      end = new Date(start);
      end.setDate(end.getDate() + (12 * 7));
    }

    const dayMap: { [key: string]: number } = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 0,
    };

    const dayNumbers = days.map((day: string) => dayMap[day.toLowerCase()]).filter(Boolean);

    // Check if student is Saturday-only (only Saturday in preferred days)
    const isSaturdayOnly = dayNumbers.length === 1 && dayNumbers[0] === 6;
    
    // Check if student is weekday-only (no Saturday in preferred days)
    const isWeekdayOnly = !dayNumbers.includes(6);

    // Generate lessons for each day in the schedule
    const lessonsByWeek: { [weekKey: string]: Lesson[] } = {};

    // Get South African holidays
    const holidays = this.getSouthAfricanHolidays(start.getFullYear(), end.getFullYear());
    const holidayDates = new Set(holidays.map(h => h.toISOString().split('T')[0]));

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      // Skip South African holidays
      const dateStr = date.toISOString().split('T')[0];
      if (holidayDates.has(dateStr)) {
        continue;
      }

      const dayOfWeek = date.getDay();
      
      if (dayNumbers.includes(dayOfWeek)) {
        // For Saturday-only students: only allow Saturday
        if (isSaturdayOnly && dayOfWeek !== 6) {
          continue;
        }

        // Get week key (year-week)
        const weekKey = this.getWeekKey(date);

        // For weekday students: limit to 2 sessions per week
        if (isWeekdayOnly) {
          if (!lessonsByWeek[weekKey]) {
            lessonsByWeek[weekKey] = [];
          }
          // Skip if already have 2 weekday sessions this week
          if (lessonsByWeek[weekKey].length >= 2) {
            continue;
          }
        }

        // This day matches one of the preferred days
        for (const timeStr of times) {
          const [hours, minutes] = timeStr.split(':').map(Number);
          let scheduledAt = new Date(date);
          scheduledAt.setHours(hours, minutes || 0, 0, 0);

          if (scheduledAt >= new Date()) {
            // Check for conflicts with existing lessons (using pre-fetched data)
            const conflict = this.checkConflictOptimized(
              existingTutorLessons,
              existingStudentLessons,
              scheduledAt,
              duration
            );
            
            // If conflict exists, try to find a free day within the same week
            if (conflict) {
              const rescheduledDate = await this.findFreeDayOptimized(
                existingTutorLessons,
                existingStudentLessons,
                scheduledAt,
                duration,
                dayNumbers,
                end
              );
              
              if (rescheduledDate) {
                scheduledAt = rescheduledDate;
                // Notify student about rescheduling
                await this.notificationsService.create({
                  type: 'session_scheduled' as any,
                  recipientType: 'student' as any,
                  studentId: request.studentId,
                  title: 'Lesson Rescheduled',
                  message: `Your lesson on ${date.toLocaleDateString()} at ${timeStr} has been rescheduled to ${rescheduledDate.toLocaleDateString()} at ${rescheduledDate.toLocaleTimeString()} due to a scheduling conflict.`,
                });
              } else {
                // If no free day found, skip this lesson
                console.warn(`Could not find free slot for lesson on ${date.toLocaleDateString()} at ${timeStr}`);
                continue;
              }
            }

            // Use lessonType from schedule, default to ONLINE if not specified
            const lessonTypeValue = lessonType === 'in_person' 
              ? LessonType.IN_PERSON 
              : LessonType.ONLINE;

            const lesson = this.lessonRepository.create({
              tutorId: request.tutorId,
              studentId: request.studentId,
              courseId: request.courseId,
              subject: request.course.subject || request.course.name,
              scheduledAt,
              duration,
              type: lessonTypeValue,
              status: LessonStatus.SCHEDULED,
              requestId: request.id,
              isRecurring: frequency === 'weekly',
              recurringPattern: JSON.stringify({ frequency, days, times, endDate }),
            });

            lessons.push(lesson);
            if (isWeekdayOnly) {
              if (!lessonsByWeek[weekKey]) {
                lessonsByWeek[weekKey] = [];
              }
              lessonsByWeek[weekKey].push(lesson);
            }
          }
        }
      }
    }

    // Filter lessons for weekday students to ensure max 2 per week
    let finalLessons = lessons;
    if (isWeekdayOnly) {
      finalLessons = [];
      for (const weekKey in lessonsByWeek) {
        finalLessons.push(...lessonsByWeek[weekKey].slice(0, 2));
      }
    }

    console.log(`[generateLessonsFromRequest] Generated ${finalLessons.length} lessons (from ${lessons.length} total)`);
    console.log(`[generateLessonsFromRequest] Lesson dates:`, finalLessons.map(l => ({ 
      date: l.scheduledAt, 
      studentId: l.studentId,
      subject: l.subject 
    })));

    // Check if lessons already exist for this request to avoid duplicates
    const existingLessons = await this.lessonRepository.find({
      where: { requestId: request.id },
    });

    if (existingLessons.length > 0) {
      console.log(`[generateLessonsFromRequest] Found ${existingLessons.length} existing lessons for request ${request.id}. Skipping generation to avoid duplicates.`);
      return existingLessons;
    }

    // Generate lessons for the full term/duration (no longer limiting to 4 weeks)
    if (finalLessons.length === 0) {
      console.warn(`[generateLessonsFromRequest] No lessons generated for request ${request.id}. Check schedule data:`, scheduleData);
      throw new BadRequestException(`No lessons could be generated. Check schedule dates and preferences.`);
    }

    const savedLessons = await this.lessonRepository.save(finalLessons);
    console.log(`[generateLessonsFromRequest] Successfully saved ${savedLessons.length} lessons for request ${request.id}`);
    
    return savedLessons;
  }

  /**
   * Regenerate lessons for accepted requests that don't have lessons yet
   */
  async regenerateLessonsForAcceptedRequests(tutorId: string): Promise<{ [requestId: string]: number }> {
    console.log(`[regenerateLessonsForAcceptedRequests] Starting for tutor: ${tutorId}`);
    
    // Find all accepted requests for this tutor
    const acceptedRequests = await this.requestRepository.find({
      where: { 
        tutorId,
        status: 'accepted' as any,
      },
      relations: ['course', 'student'],
    });

    console.log(`[regenerateLessonsForAcceptedRequests] Found ${acceptedRequests.length} accepted requests`);

    const results: { [requestId: string]: number } = {};

    for (const request of acceptedRequests) {
      // Check if lessons already exist
      const existingLessons = await this.lessonRepository.find({
        where: { requestId: request.id },
      });

      if (existingLessons.length > 0) {
        console.log(`[regenerateLessonsForAcceptedRequests] Request ${request.id} already has ${existingLessons.length} lessons. Skipping.`);
        results[request.id] = existingLessons.length;
        continue;
      }

      // Generate lessons
      try {
        console.log(`[regenerateLessonsForAcceptedRequests] Generating lessons for request ${request.id} (Student: ${request.student?.firstName} ${request.student?.lastName})`);
        const generatedLessons = await this.generateLessonsFromRequest(request.id);
        results[request.id] = generatedLessons.length;
        console.log(`[regenerateLessonsForAcceptedRequests] Generated ${generatedLessons.length} lessons for request ${request.id}`);
      } catch (error) {
        console.error(`[regenerateLessonsForAcceptedRequests] Failed to generate lessons for request ${request.id}:`, error);
        results[request.id] = 0;
      }
    }

    return results;
  }

  /**
   * Check if there's a scheduling conflict for tutor or student (optimized version using pre-fetched lessons)
   */
  private checkConflictOptimized(
    existingTutorLessons: Lesson[],
    existingStudentLessons: Lesson[],
    scheduledAt: Date,
    duration: number
  ): boolean {
    const endTime = new Date(scheduledAt);
    endTime.setMinutes(endTime.getMinutes() + duration);

    // Check for tutor conflicts
    const tutorHasConflict = existingTutorLessons.some((lesson) => {
      const lessonStart = new Date(lesson.scheduledAt);
      const lessonEnd = new Date(lessonStart);
      lessonEnd.setMinutes(lessonEnd.getMinutes() + lesson.duration);

      // Check if times overlap
      return (
        (scheduledAt >= lessonStart && scheduledAt < lessonEnd) ||
        (endTime > lessonStart && endTime <= lessonEnd) ||
        (scheduledAt <= lessonStart && endTime >= lessonEnd)
      );
    });

    // Check for student conflicts
    const studentHasConflict = existingStudentLessons.some((lesson) => {
      const lessonStart = new Date(lesson.scheduledAt);
      const lessonEnd = new Date(lessonStart);
      lessonEnd.setMinutes(lessonEnd.getMinutes() + lesson.duration);

      // Check if times overlap
      return (
        (scheduledAt >= lessonStart && scheduledAt < lessonEnd) ||
        (endTime > lessonStart && endTime <= lessonEnd) ||
        (scheduledAt <= lessonStart && endTime >= lessonEnd)
      );
    });

    return tutorHasConflict || studentHasConflict;
  }

  /**
   * Check if there's a scheduling conflict for tutor or student (async version for single checks)
   */
  private async checkConflict(
    tutorId: string,
    studentId: string,
    scheduledAt: Date,
    duration: number
  ): Promise<boolean> {
    const endTime = new Date(scheduledAt);
    endTime.setMinutes(endTime.getMinutes() + duration);

    // Check for tutor conflicts
    const tutorConflicts = await this.lessonRepository.find({
      where: {
        tutorId,
        status: LessonStatus.SCHEDULED,
      },
    });

    const tutorHasConflict = tutorConflicts.some((lesson) => {
      const lessonStart = new Date(lesson.scheduledAt);
      const lessonEnd = new Date(lessonStart);
      lessonEnd.setMinutes(lessonEnd.getMinutes() + lesson.duration);

      // Check if times overlap
      return (
        (scheduledAt >= lessonStart && scheduledAt < lessonEnd) ||
        (endTime > lessonStart && endTime <= lessonEnd) ||
        (scheduledAt <= lessonStart && endTime >= lessonEnd)
      );
    });

    // Check for student conflicts
    const studentConflicts = await this.lessonRepository.find({
      where: {
        studentId,
        status: LessonStatus.SCHEDULED,
      },
    });

    const studentHasConflict = studentConflicts.some((lesson) => {
      const lessonStart = new Date(lesson.scheduledAt);
      const lessonEnd = new Date(lessonStart);
      lessonEnd.setMinutes(lessonEnd.getMinutes() + lesson.duration);

      // Check if times overlap
      return (
        (scheduledAt >= lessonStart && scheduledAt < lessonEnd) ||
        (endTime > lessonStart && endTime <= lessonEnd) ||
        (scheduledAt <= lessonStart && endTime >= lessonEnd)
      );
    });

    return tutorHasConflict || studentHasConflict;
  }

  /**
   * Find a free day within the same week for rescheduling (optimized version)
   * Prioritizes keeping the same time when moving to a free day
   */
  private async findFreeDayOptimized(
    existingTutorLessons: Lesson[],
    existingStudentLessons: Lesson[],
    originalDate: Date,
    duration: number,
    preferredDays: number[],
    endDate: Date
  ): Promise<Date | null> {
    const originalDayOfWeek = originalDate.getDay();
    const originalHours = originalDate.getHours();
    const originalMinutes = originalDate.getMinutes();
    
    console.log(`[findFreeDayOptimized] Looking for free slot. Original: ${originalDate.toLocaleString()}, Day: ${originalDayOfWeek}, Time: ${originalHours}:${originalMinutes}`);
    
    // Strategy 1: Try same day of week with same time (next week, week after, etc.)
    for (let weekOffset = 1; weekOffset <= 4; weekOffset++) {
      const checkDate = new Date(originalDate);
      checkDate.setDate(checkDate.getDate() + (weekOffset * 7));
      
      if (checkDate > endDate) {
        break;
      }
      
      const testTime = new Date(checkDate);
      testTime.setHours(originalHours, originalMinutes, 0, 0);
      
      if (testTime >= new Date()) {
        const hasConflict = this.checkConflictOptimized(
          existingTutorLessons,
          existingStudentLessons,
          testTime,
          duration
        );
        if (!hasConflict) {
          console.log(`[findFreeDayOptimized] Found free slot: ${testTime.toLocaleString()} (same day of week, same time)`);
          return testTime;
        }
      }
    }
    
    // Strategy 2: Try preferred days with same time (within 14 days)
    for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
      const checkDate = new Date(originalDate);
      checkDate.setDate(checkDate.getDate() + dayOffset);

      if (checkDate > endDate) {
        break;
      }

      const dayOfWeek = checkDate.getDay();
      
      // Try preferred days first
      const daysToCheck = preferredDays.length > 0 ? preferredDays : [0, 1, 2, 3, 4, 5, 6];
      
      if (daysToCheck.includes(dayOfWeek)) {
        // Try the same time first
        const testTime = new Date(checkDate);
        testTime.setHours(originalHours, originalMinutes, 0, 0);

        if (testTime >= new Date()) {
          const hasConflict = this.checkConflictOptimized(
            existingTutorLessons,
            existingStudentLessons,
            testTime,
            duration
          );
          if (!hasConflict) {
            console.log(`[findFreeDayOptimized] Found free slot: ${testTime.toLocaleString()} (preferred day, same time)`);
            return testTime;
          }
        }
      }
    }

    // Strategy 3: Try any day with same time (within 14 days)
    for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
      const checkDate = new Date(originalDate);
      checkDate.setDate(checkDate.getDate() + dayOffset);

      if (checkDate > endDate) {
        break;
      }

      const testTime = new Date(checkDate);
      testTime.setHours(originalHours, originalMinutes, 0, 0);

      if (testTime >= new Date()) {
        const hasConflict = this.checkConflictOptimized(
          existingTutorLessons,
          existingStudentLessons,
          testTime,
          duration
        );
        if (!hasConflict) {
          console.log(`[findFreeDayOptimized] Found free slot: ${testTime.toLocaleString()} (any day, same time)`);
          return testTime;
        }
      }
    }

    // Strategy 4: Last resort - try different times on preferred days
    for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
      const checkDate = new Date(originalDate);
      checkDate.setDate(checkDate.getDate() + dayOffset);

      if (checkDate > endDate) {
        break;
      }

      const dayOfWeek = checkDate.getDay();
      const daysToCheck = preferredDays.length > 0 ? preferredDays : [0, 1, 2, 3, 4, 5, 6];
      
      if (daysToCheck.includes(dayOfWeek)) {
        // Try alternative times (morning, afternoon, evening)
        const timeSlots = [
          { hour: 9, minute: 0 },   // 9 AM
          { hour: 14, minute: 0 },  // 2 PM
          { hour: 17, minute: 0 }, // 5 PM
        ];

        for (const slot of timeSlots) {
          const testSlot = new Date(checkDate);
          testSlot.setHours(slot.hour, slot.minute, 0, 0);

          if (testSlot >= new Date()) {
            const slotConflict = this.checkConflictOptimized(
              existingTutorLessons,
              existingStudentLessons,
              testSlot,
              duration
            );
            if (!slotConflict) {
              console.log(`[findFreeDayOptimized] Found free slot: ${testSlot.toLocaleString()} (alternative time)`);
              return testSlot;
            }
          }
        }
      }
    }

    console.log(`[findFreeDayOptimized] No free slot found within 14 days`);
    return null;
  }

  /**
   * Find a free day within the same week for rescheduling (async version for single checks)
   */
  private async findFreeDay(
    tutorId: string,
    studentId: string,
    originalDate: Date,
    duration: number,
    preferredDays: number[],
    endDate: Date
  ): Promise<Date | null> {
    // Start from the original date and check up to 14 days ahead
    for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
      const checkDate = new Date(originalDate);
      checkDate.setDate(checkDate.getDate() + dayOffset);

      // Don't go beyond end date
      if (checkDate > endDate) {
        break;
      }

      const dayOfWeek = checkDate.getDay();
      
      // Try preferred days first, then any day
      const daysToCheck = preferredDays.length > 0 ? preferredDays : [0, 1, 2, 3, 4, 5, 6];
      
      if (daysToCheck.includes(dayOfWeek)) {
        // Try the same time first
        const testTime = new Date(checkDate);
        testTime.setHours(originalDate.getHours(), originalDate.getMinutes(), 0, 0);

        if (testTime >= new Date()) {
          const hasConflict = await this.checkConflict(tutorId, studentId, testTime, duration);
          if (!hasConflict) {
            return testTime;
          }

          // Try different times on the same day (morning, afternoon, evening)
          const timeSlots = [
            { hour: 9, minute: 0 },   // 9 AM
            { hour: 14, minute: 0 },  // 2 PM
            { hour: 17, minute: 0 }, // 5 PM
          ];

          for (const slot of timeSlots) {
            const testSlot = new Date(checkDate);
            testSlot.setHours(slot.hour, slot.minute, 0, 0);

            if (testSlot >= new Date()) {
              const slotConflict = await this.checkConflict(tutorId, studentId, testSlot, duration);
              if (!slotConflict) {
                return testSlot;
              }
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Get South African public holidays for given years
   */
  private getSouthAfricanHolidays(startYear: number, endYear: number): Date[] {
    const holidays: Date[] = [];
    
    for (let year = startYear; year <= endYear; year++) {
      // Fixed date holidays
      holidays.push(new Date(year, 0, 1));   // New Year's Day
      holidays.push(new Date(year, 2, 21));  // Human Rights Day
      holidays.push(new Date(year, 3, 27));  // Freedom Day
      holidays.push(new Date(year, 4, 1));   // Workers' Day
      holidays.push(new Date(year, 5, 16));  // Youth Day
      holidays.push(new Date(year, 7, 9));   // National Women's Day
      holidays.push(new Date(year, 8, 24));  // Heritage Day
      holidays.push(new Date(year, 11, 16)); // Day of Reconciliation
      holidays.push(new Date(year, 11, 25)); // Christmas Day
      holidays.push(new Date(year, 11, 26)); // Day of Goodwill
      
      // Calculate Easter (approximate - using algorithm)
      const easter = this.calculateEaster(year);
      holidays.push(new Date(easter.getTime() - 2 * 24 * 60 * 60 * 1000)); // Good Friday
      holidays.push(new Date(easter.getTime() + 1 * 24 * 60 * 60 * 1000)); // Family Day (Easter Monday)
    }
    
    return holidays;
  }

  /**
   * Calculate Easter Sunday date using anonymous Gregorian algorithm
   */
  private calculateEaster(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    
    return new Date(year, month, day);
  }

  /**
   * Get week key for a date (year-week format)
   */
  private getWeekKey(date: Date): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
  }

  /**
   * Start a session
   */
  async startSession(lessonId: string, userId: string, userType: 'tutor' | 'student'): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Verify user has access
    if (userType === 'tutor' && lesson.tutorId !== userId) {
      throw new ForbiddenException('Not authorized to start this session');
    }
    if (userType === 'student' && lesson.studentId !== userId) {
      throw new ForbiddenException('Not authorized to start this session');
    }

    if (lesson.status !== LessonStatus.SCHEDULED) {
      throw new BadRequestException('Lesson is not scheduled');
    }

    if (lesson.startedAt) {
      throw new BadRequestException('Session already started');
    }

    lesson.startedAt = new Date();
    lesson.status = LessonStatus.SCHEDULED; // Keep as scheduled until ended

    return this.lessonRepository.save(lesson);
  }

  /**
   * End a session and calculate duration
   */
  async endSession(lessonId: string, userId: string, userType: 'tutor' | 'student'): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['student', 'tutor'],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Only tutors can end sessions
    if (userType !== 'tutor' || lesson.tutorId !== userId) {
      throw new ForbiddenException('Only the tutor can end this session');
    }

    if (!lesson.startedAt) {
      throw new BadRequestException('Session has not been started');
    }

    if (lesson.endedAt) {
      throw new BadRequestException('Session already ended');
    }

    lesson.endedAt = new Date();
    const durationMs = lesson.endedAt.getTime() - lesson.startedAt.getTime();
    lesson.actualDuration = Math.round(durationMs / (1000 * 60)); // Duration in minutes
    
    // Update status to completed
    lesson.status = LessonStatus.COMPLETED;
    lesson.completedAt = new Date();

    const savedLesson = await this.lessonRepository.save(lesson);

    // Create payment record with fixed rates: R100 total, R70 tutor, R30 commission
    try {
      await this.paymentsService.createPaymentFromSession(savedLesson.id);
    } catch (error) {
      console.error('Error creating payment for session:', error);
      // Don't fail the session end if payment creation fails
    }
    
    return savedLesson;
  }

  /**
   * Cancel a lesson (must be at least 1 day before)
   */
  async cancelLesson(lessonId: string, userId: string, userType: 'tutor' | 'student'): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (userType === 'tutor' && lesson.tutorId !== userId) {
      throw new ForbiddenException('Not authorized');
    }
    if (userType === 'student' && lesson.studentId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    const now = new Date();
    const lessonTime = new Date(lesson.scheduledAt);
    const hoursUntilLesson = (lessonTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilLesson < 24) {
      throw new BadRequestException('Lesson can only be cancelled at least 24 hours in advance');
    }

    lesson.status = LessonStatus.CANCELLED;
    return this.lessonRepository.save(lesson);
  }

  /**
   * Reschedule a lesson
   */
  async rescheduleLesson(
    lessonId: string,
    userId: string,
    userType: 'tutor' | 'student',
    newScheduledAt: Date,
  ): Promise<Lesson> {
    const lesson = await this.findOne(lessonId, userType === 'tutor' ? userId : '');

    if (userType === 'student' && lesson.studentId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    const now = new Date();
    const hoursUntilLesson = (new Date(lesson.scheduledAt).getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilLesson < 24) {
      throw new BadRequestException('Lesson can only be rescheduled at least 24 hours in advance');
    }

    lesson.scheduledAt = new Date(newScheduledAt);
    return this.lessonRepository.save(lesson);
  }

  /**
   * Get student lessons
   */
  async findStudentLessons(studentId: string): Promise<Lesson[]> {
    return this.lessonRepository.find({
      where: { studentId },
      relations: ['tutor', 'course'],
      order: { scheduledAt: 'ASC' },
    });
  }

  /**
   * Get calendar view (lessons grouped by date)
   */
  async getCalendarView(tutorId?: string, studentId?: string, month?: number, year?: number) {
    const where: any = {};
    if (tutorId) where.tutorId = tutorId;
    if (studentId) where.studentId = studentId;

    let query = this.lessonRepository
      .createQueryBuilder('lesson')
      .where(where)
      .leftJoinAndSelect('lesson.student', 'student')
      .leftJoinAndSelect('lesson.tutor', 'tutor')
      .leftJoinAndSelect('lesson.course', 'course');

    if (month !== undefined && year !== undefined) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);
      query = query.andWhere('lesson.scheduledAt >= :startDate', { startDate });
      query = query.andWhere('lesson.scheduledAt <= :endDate', { endDate });
    }

    const lessons = await query.orderBy('lesson.scheduledAt', 'ASC').getMany();

    // Group by date
    const calendar: { [date: string]: Lesson[] } = {};
    lessons.forEach((lesson) => {
      const dateKey = new Date(lesson.scheduledAt).toISOString().split('T')[0];
      if (!calendar[dateKey]) {
        calendar[dateKey] = [];
      }
      calendar[dateKey].push(lesson);
    });

    return calendar;
  }
}

