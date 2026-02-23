import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TutorRequest } from '../tutor-requests/tutor-requests.entity';
import { StudentLesson } from '../student-lessons/student-lessons.entity';
import { TutorSessionsOrder } from '../tutor-sessions-orders/tutor-sessions-orders.entity';
import { BursaryStudent } from '../bursary-students/bursary-students.entity';
import { Invoice } from '../invoices/invoices.entity';
import { StudentProgress } from '../student-progress/student-progress.entity';
import { Lesson } from '../lessons/lessons.entity';
import { Course } from '../courses/courses.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(TutorRequest)
    private readonly tutorRequestRepository: Repository<TutorRequest>,
    @InjectRepository(StudentLesson)
    private readonly studentLessonRepository: Repository<StudentLesson>,
    @InjectRepository(TutorSessionsOrder)
    private readonly tutorSessionsOrderRepository: Repository<TutorSessionsOrder>,
    @InjectRepository(BursaryStudent)
    private readonly bursaryStudentRepository: Repository<BursaryStudent>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(StudentProgress)
    private readonly studentProgressRepository: Repository<StudentProgress>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async getDashboardStats(bursaryName?: string): Promise<{
    totalStudents: number;
    totalBudget: number;
    budgetUsed: number;
    activeRequests: number;
    completedLessons: number;
    averageRating: number;
    monthlyStats: Array<{
      month: string;
      requests: number;
      lessons: number;
      budget: number;
    }>;
  }> {
    // Get basic counts
    const totalStudents = bursaryName 
      ? await this.bursaryStudentRepository
          .createQueryBuilder('student')
          .leftJoin('student.bursaryName', 'bursary')
          .where('bursary.bursary_name = :bursaryName', { bursaryName })
          .getCount()
      : await this.bursaryStudentRepository.count();

    const activeRequests = bursaryName
      ? await this.tutorRequestRepository
          .createQueryBuilder('request')
          .leftJoin('request.bursary', 'bursary')
          .where('bursary.bursary_name = :bursaryName', { bursaryName })
          .andWhere('request.paid = false')
          .andWhere('request.notInterested = false')
          .andWhere('request.requestDelete = false')
          .getCount()
      : await this.tutorRequestRepository.count({
          where: { paid: false, notInterested: false, requestDelete: false },
        });

    // Get completed lessons - filter by bursary through tutor requests
    const completedLessonsQuery = this.studentLessonRepository
      .createQueryBuilder('lesson')
      .innerJoin('lesson.request', 'request')
      .where('lesson.adminLessonApproved = true');
    
    if (bursaryName) {
      completedLessonsQuery.andWhere('request.bursaryName = :bursaryName', { bursaryName });
    }
    
    const completedLessons = await completedLessonsQuery.getCount();

    // Calculate budget stats
    const budgetStats = await this.tutorRequestRepository
      .createQueryBuilder('request')
      .select([
        'SUM(request.totalAmount) as totalBudget',
        'SUM(CASE WHEN request.paid = true THEN request.totalAmount ELSE 0 END) as budgetUsed',
      ])
      .where(bursaryName ? 'request.bursaryName = :bursaryName' : '1=1', { bursaryName })
      .getRawOne();

    // Calculate average rating - filter by bursary through tutor requests
    const ratingStatsQuery = this.studentLessonRepository
      .createQueryBuilder('lesson')
      .innerJoin('lesson.request', 'request')
      .select('AVG(lesson.studentLessonRating) as averageRating')
      .where('lesson.studentLessonRating IS NOT NULL');
    
    if (bursaryName) {
      ratingStatsQuery.andWhere('request.bursaryName = :bursaryName', { bursaryName });
    }
    
    const ratingStats = await ratingStatsQuery.getRawOne();

    // Get monthly stats for the last 12 months
    const monthlyStats = await this.getMonthlyStats(bursaryName);

    return {
      totalStudents,
      totalBudget: parseFloat(budgetStats?.totalBudget || '0'),
      budgetUsed: parseFloat(budgetStats?.budgetUsed || '0'),
      activeRequests,
      completedLessons,
      averageRating: parseFloat(ratingStats?.averageRating || '0'),
      monthlyStats,
    };
  }

  async getStudentAnalytics(studentEmail: string): Promise<{
    totalRequests: number;
    totalLessons: number;
    totalHours: number;
    totalBudget: number;
    budgetUsed: number;
    averageRating: number;
    subjects: string[];
    recentLessons: Array<{
      date: Date;
      subject: string;
      hours: number;
      rating: number;
    }>;
  }> {
    // Get student's requests
    const requests = await this.tutorRequestRepository.find({
      where: { studentEmail },
    });

    // Get student's lessons
    const lessons = await this.studentLessonRepository.find({
      where: { request: { studentEmail } },
      relations: ['request'],
      order: { lessonDate: 'DESC' },
    });

    // Calculate stats
    const totalRequests = requests.length;
    const totalLessons = lessons.length;
    const totalHours = lessons.reduce((sum, lesson) => sum + (lesson.lessonHours || 0), 0);
    const totalBudget = requests.reduce((sum, request) => sum + (request.totalAmount || 0), 0);
    const budgetUsed = requests
      .filter(request => request.paid)
      .reduce((sum, request) => sum + (request.totalAmount || 0), 0);

    const ratings = lessons.filter(lesson => lesson.studentLessonRating).map(lesson => lesson.studentLessonRating);
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;

    // Get unique subjects
    const subjects = [...new Set(lessons.map(lesson => lesson.courseName).filter(Boolean))];

    // Get recent lessons (last 10)
    const recentLessons = lessons.slice(0, 10).map(lesson => ({
      date: lesson.lessonDate,
      subject: lesson.courseName,
      hours: lesson.lessonHours || 0,
      rating: lesson.studentLessonRating || 0,
    }));

    return {
      totalRequests,
      totalLessons,
      totalHours,
      totalBudget,
      budgetUsed,
      averageRating,
      subjects,
      recentLessons,
    };
  }

  async getBursaryAnalytics(bursaryName: string): Promise<{
    totalStudents: number;
    totalRequests: number;
    totalBudget: number;
    budgetUsed: number;
    topStudents: Array<{
      studentEmail: string;
      studentName: string;
      totalBudget: number;
      budgetUsed: number;
      percentage: number;
    }>;
    monthlyTrends: Array<{
      month: string;
      requests: number;
      budget: number;
    }>;
  }> {
    // Get bursary students
    const students = await this.bursaryStudentRepository.find({
      where: { bursary: bursaryName },
    });

    // Get bursary requests
    const requests = await this.tutorRequestRepository.find({
      where: { bursaryName },
    });

    // Calculate stats
    const totalStudents = students.length;
    const totalRequests = requests.length;
    const totalBudget = requests.reduce((sum, request) => sum + (request.totalAmount || 0), 0);
    const budgetUsed = requests
      .filter(request => request.paid)
      .reduce((sum, request) => sum + (request.totalAmount || 0), 0);

    // Get top students by budget usage
    const studentStats = await this.tutorRequestRepository
      .createQueryBuilder('request')
      .select([
        'request.studentEmail',
        'request.studentFirstName',
        'request.studentLastName',
        'SUM(request.totalAmount) as totalBudget',
        'SUM(CASE WHEN request.paid = true THEN request.totalAmount ELSE 0 END) as budgetUsed',
      ])
      .where('request.bursaryName = :bursaryName', { bursaryName })
      .groupBy('request.studentEmail, request.studentFirstName, request.studentLastName')
      .orderBy('budgetUsed', 'DESC')
      .limit(10)
      .getRawMany();

    const topStudents = studentStats.map(student => ({
      studentEmail: student.request_studentEmail,
      studentName: `${student.request_studentFirstName} ${student.request_studentLastName}`,
      totalBudget: parseFloat(student.totalBudget || '0'),
      budgetUsed: parseFloat(student.budgetUsed || '0'),
      percentage: parseFloat(student.totalBudget || '0') > 0 
        ? (parseFloat(student.budgetUsed || '0') / parseFloat(student.totalBudget || '0')) * 100 
        : 0,
    }));

    // Get monthly trends
    const monthlyTrends = await this.getMonthlyTrends(bursaryName);

    return {
      totalStudents,
      totalRequests,
      totalBudget,
      budgetUsed,
      topStudents,
      monthlyTrends,
    };
  }

  async getMonthlyStats(bursaryName?: string): Promise<Array<{
    month: string;
    requests: number;
    lessons: number;
    budget: number;
  }>> {
    const months = [];
    const currentDate = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7); // YYYY-MM format

      const whereCondition = bursaryName ? { bursaryName } : {};
      
      const requests = await this.tutorRequestRepository
        .createQueryBuilder('request')
        .where(bursaryName ? 'request.bursaryName = :bursaryName' : '1=1', { bursaryName })
        .andWhere('request.creationDate >= :startDate', { startDate: new Date(date.getFullYear(), date.getMonth(), 1) })
        .andWhere('request.creationDate < :endDate', { endDate: new Date(date.getFullYear(), date.getMonth() + 1, 1) })
        .getCount();

      // Get lessons filtered by bursary through tutor requests
      const lessonsQuery = this.studentLessonRepository
        .createQueryBuilder('lesson')
        .innerJoin('lesson.request', 'request')
        .where('lesson.lessonDate >= :startDate', { startDate: new Date(date.getFullYear(), date.getMonth(), 1) })
        .andWhere('lesson.lessonDate < :endDate', { endDate: new Date(date.getFullYear(), date.getMonth() + 1, 1) });
      
      if (bursaryName) {
        lessonsQuery.andWhere('request.bursaryName = :bursaryName', { bursaryName });
      }
      
      const lessons = await lessonsQuery.getCount();

      const budgetResult = await this.tutorRequestRepository
        .createQueryBuilder('request')
        .select('SUM(request.totalAmount) as budget')
        .where(bursaryName ? 'request.bursaryName = :bursaryName' : '1=1', { bursaryName })
        .andWhere('request.creationDate >= :startDate', { startDate: new Date(date.getFullYear(), date.getMonth(), 1) })
        .andWhere('request.creationDate < :endDate', { endDate: new Date(date.getFullYear(), date.getMonth() + 1, 1) })
        .getRawOne();

      months.push({
        month: monthStr,
        requests,
        lessons,
        budget: parseFloat(budgetResult?.budget || '0'),
      });
    }

    return months;
  }

  async getMonthlyTrends(bursaryName: string): Promise<Array<{
    month: string;
    requests: number;
    budget: number;
  }>> {
    const months = [];
    const currentDate = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7); // YYYY-MM format

      const requests = await this.tutorRequestRepository
        .createQueryBuilder('request')
        .where('request.bursaryName = :bursaryName', { bursaryName })
        .andWhere('request.creationDate >= :startDate', { startDate: new Date(date.getFullYear(), date.getMonth(), 1) })
        .andWhere('request.creationDate < :endDate', { endDate: new Date(date.getFullYear(), date.getMonth() + 1, 1) })
        .getCount();

      const budgetResult = await this.tutorRequestRepository
        .createQueryBuilder('request')
        .select('SUM(request.totalAmount) as budget')
        .where('request.bursaryName = :bursaryName', { bursaryName })
        .andWhere('request.creationDate >= :startDate', { startDate: new Date(date.getFullYear(), date.getMonth(), 1) })
        .andWhere('request.creationDate < :endDate', { endDate: new Date(date.getFullYear(), date.getMonth() + 1, 1) })
        .getRawOne();

      months.push({
        month: monthStr,
        requests,
        budget: parseFloat(budgetResult?.budget || '0'),
      });
    }

    return months;
  }

  async getComprehensiveDashboardStats(bursaryName?: string): Promise<{
    students: {
      total: number;
      active: number;
      completed: number;
      averageProgress: number;
      averageGPA: number;
    };
    courses: {
      total: number;
      active: number;
      averageCompletionRate: number;
    };
    lessons: {
      total: number;
      published: number;
      draft: number;
      totalEnrollments: number;
      averageCompletionRate: number;
    };
    invoices: {
      total: number;
      paid: number;
      pending: number;
      overdue: number;
      totalRevenue: number;
      pendingAmount: number;
    };
    requests: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
    budget: {
      totalBudget: number;
      budgetUsed: number;
      budgetUtilization: number;
    };
  }> {
    // Student stats - query bursary_students table for active students (not disabled)
    const studentStatsQuery = this.bursaryStudentRepository
      .createQueryBuilder('bs')
      .select([
        'COUNT(*) as total',
        'COUNT(CASE WHEN bs.studentDisallowed = false AND (bs.status IS NULL OR bs.status != \'disabled\') THEN 1 END) as active',
        'COUNT(CASE WHEN bs.status = \'completed\' THEN 1 END) as completed',
      ])
    
    if (bursaryName) {
      studentStatsQuery.where('bs.bursary = :bursaryName', { bursaryName })
    }
    
    const studentStats = await studentStatsQuery.getRawOne()

    // Get average progress and GPA from student_progress table
    const progressStatsQuery = this.studentProgressRepository
      .createQueryBuilder('sp')
      .select([
        'AVG(sp.overallProgress) as averageProgress',
        'AVG(sp.gpa) as averageGPA',
      ])
    
    if (bursaryName) {
      progressStatsQuery.where('sp.bursaryName = :bursaryName', { bursaryName })
    }
    
    const progressStats = await progressStatsQuery.getRawOne()

    // Course stats - filter by bursary through tutor requests
    // Count unique courses from requestCourses field in tutor requests for this bursary
    let courseStats;
    if (bursaryName) {
      // Get all tutor requests for this bursary and extract unique courses from requestCourses
      const requests = await this.tutorRequestRepository.find({
        where: { bursaryName },
        select: ['requestCourses'],
      });
      
      // Extract unique courses from requestCourses (which is a text field, possibly JSON or comma-separated)
      const allCourses = new Set<string>();
      requests.forEach(request => {
        if (request.requestCourses) {
          try {
            // Try parsing as JSON array
            const courses = JSON.parse(request.requestCourses);
            if (Array.isArray(courses)) {
              courses.forEach((course: any) => {
                if (typeof course === 'string') {
                  allCourses.add(course);
                } else if (course && course.course) {
                  allCourses.add(course.course);
                }
              });
            }
          } catch {
            // If not JSON, try comma-separated
            request.requestCourses.split(',').forEach(course => {
              const trimmed = course.trim();
              if (trimmed) allCourses.add(trimmed);
            });
          }
        }
      });
      
      courseStats = {
        total: allCourses.size,
        active: allCourses.size, // Consider all courses from requests as active
      };
    } else {
      courseStats = await this.courseRepository
        .createQueryBuilder('course')
        .select([
          'COUNT(*) as total',
          'AVG(CASE WHEN course.moduleYear IS NOT NULL THEN 1 ELSE 0 END) as active',
        ])
        .getRawOne();
    }

    // Lesson stats
    const lessonStats = await this.lessonRepository
      .createQueryBuilder('lesson')
      .select([
        'COUNT(*) as total',
        'COUNT(CASE WHEN lesson.status = \'published\' THEN 1 END) as published',
        'COUNT(CASE WHEN lesson.status = \'draft\' THEN 1 END) as draft',
        'SUM(lesson.studentsEnrolled) as totalEnrollments',
        'AVG(lesson.completionRate) as averageCompletionRate',
      ])
      .where(bursaryName ? 'lesson.bursaryName = :bursaryName' : '1=1', { bursaryName })
      .getRawOne();

    // Invoice stats
    const invoiceStats = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select([
        'COUNT(*) as total',
        'COUNT(CASE WHEN invoice.status = \'paid\' THEN 1 END) as paid',
        'COUNT(CASE WHEN invoice.status = \'pending\' THEN 1 END) as pending',
        'COUNT(CASE WHEN invoice.status = \'overdue\' THEN 1 END) as overdue',
        'SUM(CASE WHEN invoice.status = \'paid\' THEN invoice.amount ELSE 0 END) as totalRevenue',
        'SUM(CASE WHEN invoice.status IN (\'pending\', \'overdue\') THEN invoice.amount ELSE 0 END) as pendingAmount',
      ])
      .where(bursaryName ? 'invoice.bursaryName = :bursaryName' : '1=1', { bursaryName })
      .getRawOne();

    // Request stats
    const requestStats = await this.tutorRequestRepository
      .createQueryBuilder('request')
      .select([
        'COUNT(*) as total',
        'COUNT(CASE WHEN request.paid = false AND request.notInterested = false AND request.requestDelete = false THEN 1 END) as pending',
        'COUNT(CASE WHEN request.paid = true THEN 1 END) as approved',
        'COUNT(CASE WHEN request.notInterested = true THEN 1 END) as rejected',
      ])
      .where(bursaryName ? 'request.bursaryName = :bursaryName' : '1=1', { bursaryName })
      .getRawOne();

    // Budget stats
    const budgetStats = await this.tutorRequestRepository
      .createQueryBuilder('request')
      .select([
        'SUM(request.totalAmount) as totalBudget',
        'SUM(CASE WHEN request.paid = true THEN request.totalAmount ELSE 0 END) as budgetUsed',
      ])
      .where(bursaryName ? 'request.bursaryName = :bursaryName' : '1=1', { bursaryName })
      .getRawOne();

    const totalBudget = parseFloat(budgetStats?.totalBudget || '0');
    const budgetUsed = parseFloat(budgetStats?.budgetUsed || '0');
    const budgetUtilization = totalBudget > 0 ? (budgetUsed / totalBudget) * 100 : 0;

    return {
      students: {
        total: parseInt(studentStats?.total || '0'),
        active: parseInt(studentStats?.active || '0'),
        completed: parseInt(studentStats?.completed || '0'),
        averageProgress: parseFloat(progressStats?.averageProgress || '0'),
        averageGPA: parseFloat(progressStats?.averageGPA || '0'),
      },
      courses: {
        total: parseInt(courseStats?.total || '0'),
        active: parseInt(courseStats?.active || '0'),
        averageCompletionRate: 0, // This would need to be calculated based on student progress
      },
      lessons: {
        total: parseInt(lessonStats?.total || '0'),
        published: parseInt(lessonStats?.published || '0'),
        draft: parseInt(lessonStats?.draft || '0'),
        totalEnrollments: parseInt(lessonStats?.totalEnrollments || '0'),
        averageCompletionRate: parseFloat(lessonStats?.averageCompletionRate || '0'),
      },
      invoices: {
        total: parseInt(invoiceStats?.total || '0'),
        paid: parseInt(invoiceStats?.paid || '0'),
        pending: parseInt(invoiceStats?.pending || '0'),
        overdue: parseInt(invoiceStats?.overdue || '0'),
        totalRevenue: parseFloat(invoiceStats?.totalRevenue || '0'),
        pendingAmount: parseFloat(invoiceStats?.pendingAmount || '0'),
      },
      requests: {
        total: parseInt(requestStats?.total || '0'),
        pending: parseInt(requestStats?.pending || '0'),
        approved: parseInt(requestStats?.approved || '0'),
        rejected: parseInt(requestStats?.rejected || '0'),
      },
      budget: {
        totalBudget,
        budgetUsed,
        budgetUtilization,
      },
    };
  }

  async getMonthlyEnrollmentData(bursaryName?: string): Promise<Array<{
    month: string;
    students: number;
    budget: number;
  }>> {
    const months = [];
    const currentDate = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7); // YYYY-MM format

      // Query bursary students by enrollment date (use enrollmentDate if available, otherwise creationDate)
      // Format dates as YYYY-MM-DD strings to avoid timezone conversion issues
      // This ensures students are assigned to the correct month regardless of server timezone
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const startDateStr = `${year}-${month.toString().padStart(2, '0')}-01`;
      
      const nextMonthDate = new Date(year, month, 1);
      const nextYear = nextMonthDate.getFullYear();
      const nextMonth = nextMonthDate.getMonth() + 1;
      const endDateStr = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
      
      const enrollmentQuery = this.bursaryStudentRepository
        .createQueryBuilder('student')
        .where('DATE(COALESCE(student.enrollmentDate, student.creationDate)) >= :startDate::date', {
          startDate: startDateStr,
        })
        .andWhere('DATE(COALESCE(student.enrollmentDate, student.creationDate)) < :endDate::date', {
          endDate: endDateStr,
        });

      if (bursaryName) {
        enrollmentQuery.andWhere('student.bursary = :bursaryName', { bursaryName });
      }

      const students = await enrollmentQuery.getCount();

      // Get budget for this month from tutor requests
      const budgetResult = await this.tutorRequestRepository
        .createQueryBuilder('request')
        .select('SUM(request.totalAmount) as budget')
        .where(bursaryName ? 'request.bursaryName = :bursaryName' : '1=1', { bursaryName })
        .andWhere('request.creationDate >= :startDate', {
          startDate: new Date(date.getFullYear(), date.getMonth(), 1),
        })
        .andWhere('request.creationDate < :endDate', {
          endDate: new Date(date.getFullYear(), date.getMonth() + 1, 1),
        })
        .getRawOne();

      months.push({
        month: monthStr,
        students,
        budget: parseFloat(budgetResult?.budget || '0'),
      });
    }

    return months;
  }

  async getCourseAnalytics(courseId?: string): Promise<{
    courseInfo: {
      name: string;
      code: string;
      description: string;
      totalStudents: number;
      activeStudents: number;
      completionRate: number;
      averageGrade: number;
      passRate: number;
      dropoutRate: number;
    };
    monthlyProgress: Array<{
      month: string;
      enrolled: number;
      completed: number;
      dropped: number;
    }>;
    studentPerformance: Array<{
      studentName: string;
      studentEmail: string;
      progress: number;
      gpa: number;
      status: string;
    }>;
  }> {
    if (!courseId) {
      throw new Error('Course ID is required for course analytics');
    }

    const course = await this.courseRepository.findOne({ where: { uniqueId: courseId } });
    if (!course) {
      throw new Error('Course not found');
    }

    const courseStudents = await this.studentProgressRepository.find({
      where: { courseId },
    });

    const totalStudents = courseStudents.length;
    const activeStudents = courseStudents.filter(s => s.status === 'active').length;
    const completedStudents = courseStudents.filter(s => s.status === 'completed').length;
    const droppedStudents = courseStudents.filter(s => s.status === 'dropped').length;

    const completionRate = totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0;
    const dropoutRate = totalStudents > 0 ? (droppedStudents / totalStudents) * 100 : 0;
    const passRate = totalStudents > 0 ? ((completedStudents + activeStudents) / totalStudents) * 100 : 0;

    const averageGrade = courseStudents.length > 0 
      ? courseStudents.reduce((sum, s) => sum + (s.gpa || 0), 0) / courseStudents.length 
      : 0;

    // Generate monthly progress data based on actual enrollment dates
    const monthlyProgress = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7); // YYYY-MM format
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      
      // Count students enrolled in this month (use enrollmentDate if available, otherwise creationDate)
      const enrolled = courseStudents.filter(s => {
        const enrollmentDate = s.enrollmentDate || s.creationDate;
        return enrollmentDate >= date && enrollmentDate < endDate;
      }).length;
      
      // Count students completed in this month
      const completed = courseStudents.filter(s => {
        if (s.status !== 'completed' || !s.completionDate) return false;
        return s.completionDate >= date && s.completionDate < endDate;
      }).length;
      
      // Count students dropped in this month (use modifiedDate since there's no specific dropDate)
      const dropped = courseStudents.filter(s => {
        if (s.status !== 'dropped' || !s.modifiedDate) return false;
        return s.modifiedDate >= date && s.modifiedDate < endDate;
      }).length;
      
      monthlyProgress.push({
        month: monthStr,
        enrolled,
        completed,
        dropped,
      });
    }

    const studentPerformance = courseStudents.map(student => ({
      studentName: student.studentName,
      studentEmail: student.studentEmail,
      progress: student.overallProgress,
      gpa: student.gpa || 0,
      status: student.status,
    }));

    return {
      courseInfo: {
        name: course.moduleName || 'Unknown Course',
        code: course.moduleCode || 'N/A',
        description: course.moduleDescription || '',
        totalStudents,
        activeStudents,
        completionRate,
        averageGrade,
        passRate,
        dropoutRate,
      },
      monthlyProgress,
      studentPerformance,
    };
  }

  async getStudentProgressAnalytics(studentEmail?: string): Promise<{
    studentInfo: {
      name: string;
      email: string;
      course: string;
      university: string;
      yearOfStudy: number;
      enrollmentDate: string;
      status: string;
    };
    progressMetrics: {
      overallProgress: number;
      gpa: number;
      creditsCompleted: number;
      totalCredits: number;
      attendancePercentage: number;
      assignmentsPercentage: number;
      examsPercentage: number;
      participationPercentage: number;
    };
    milestones: Array<{
      name: string;
      status: string;
      progress: number;
      dueDate: string;
    }>;
    recentActivity: Array<{
      date: string;
      activity: string;
      type: string;
    }>;
  }> {
    if (!studentEmail) {
      throw new Error('Student email is required for student progress analytics');
    }

    const studentProgress = await this.studentProgressRepository.findOne({
      where: { studentEmail },
    });

    if (!studentProgress) {
      throw new Error('Student progress not found');
    }

    // Mock milestones data
    const milestones = [
      {
        name: 'Foundation Courses',
        status: studentProgress.overallProgress > 25 ? 'completed' : 'in-progress',
        progress: Math.min(studentProgress.overallProgress, 100),
        dueDate: '2024-01-15',
      },
      {
        name: 'Core Programming',
        status: studentProgress.overallProgress > 50 ? 'completed' : 'in-progress',
        progress: Math.max(0, studentProgress.overallProgress - 25),
        dueDate: '2024-06-15',
      },
      {
        name: 'Advanced Topics',
        status: studentProgress.overallProgress > 75 ? 'completed' : 'pending',
        progress: Math.max(0, studentProgress.overallProgress - 50),
        dueDate: '2024-12-15',
      },
      {
        name: 'Final Project',
        status: studentProgress.overallProgress > 90 ? 'completed' : 'pending',
        progress: Math.max(0, studentProgress.overallProgress - 75),
        dueDate: '2025-05-15',
      },
    ];

    // Mock recent activity data
    const recentActivity = [
      {
        date: '2024-01-20',
        activity: 'Completed Data Structures Assignment',
        type: 'assignment',
      },
      {
        date: '2024-01-18',
        activity: 'Attended Algorithm Design Lecture',
        type: 'lecture',
      },
      {
        date: '2024-01-15',
        activity: 'Submitted Midterm Exam',
        type: 'exam',
      },
    ];

    return {
      studentInfo: {
        name: studentProgress.studentName,
        email: studentProgress.studentEmail,
        course: studentProgress.courseName || 'Unknown Course',
        university: studentProgress.university || 'Unknown University',
        yearOfStudy: studentProgress.yearOfStudy || 1,
        enrollmentDate: studentProgress.enrollmentDate.toISOString().split('T')[0],
        status: studentProgress.status,
      },
      progressMetrics: {
        overallProgress: studentProgress.overallProgress,
        gpa: studentProgress.gpa || 0,
        creditsCompleted: studentProgress.creditsCompleted,
        totalCredits: studentProgress.totalCredits,
        attendancePercentage: studentProgress.attendancePercentage || 0,
        assignmentsPercentage: studentProgress.assignmentsPercentage || 0,
        examsPercentage: studentProgress.examsPercentage || 0,
        participationPercentage: studentProgress.participationPercentage || 0,
      },
      milestones,
      recentActivity,
    };
  }
}
