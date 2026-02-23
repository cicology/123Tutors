import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentProgress } from './student-progress.entity';
import { CreateStudentProgressDto, UpdateStudentProgressDto } from './dto/create-student-progress.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';

@Injectable()
export class StudentProgressService {
  constructor(
    @InjectRepository(StudentProgress)
    private readonly studentProgressRepository: Repository<StudentProgress>,
  ) {}

  async create(createStudentProgressDto: CreateStudentProgressDto): Promise<StudentProgress> {
    const studentProgress = this.studentProgressRepository.create(createStudentProgressDto);
    return await this.studentProgressRepository.save(studentProgress);
  }

  async findAll(
    paginationDto: PaginationDto,
    searchDto: SearchDto,
  ): Promise<{ data: StudentProgress[]; total: number }> {
    const { page = 1, limit = 10 } = paginationDto;
    const { search = '' } = searchDto;

    const queryBuilder = this.studentProgressRepository.createQueryBuilder('studentProgress');

    if (search) {
      queryBuilder.where(
        'studentProgress.studentName ILIKE :search OR studentProgress.studentEmail ILIKE :search OR studentProgress.courseName ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('studentProgress.creationDate', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(uniqueId: string): Promise<StudentProgress> {
    const studentProgress = await this.studentProgressRepository.findOne({
      where: { uniqueId },
    });

    if (!studentProgress) {
      throw new NotFoundException(`Student progress with ID ${uniqueId} not found`);
    }

    return studentProgress;
  }

  async findByStudentEmail(studentEmail: string): Promise<StudentProgress[]> {
    return await this.studentProgressRepository.find({
      where: { studentEmail },
      order: { creationDate: 'DESC' },
    });
  }

  async findByCourseId(courseId: string): Promise<StudentProgress[]> {
    return await this.studentProgressRepository.find({
      where: { courseId },
      order: { creationDate: 'DESC' },
    });
  }

  async findByBursaryName(bursaryName: string): Promise<StudentProgress[]> {
    return await this.studentProgressRepository.find({
      where: { bursaryName },
      order: { creationDate: 'DESC' },
    });
  }

  async findByStatus(status: string): Promise<StudentProgress[]> {
    return await this.studentProgressRepository.find({
      where: { status: status as any },
      order: { creationDate: 'DESC' },
    });
  }

  async update(uniqueId: string, updateStudentProgressDto: UpdateStudentProgressDto): Promise<StudentProgress> {
    const studentProgress = await this.findOne(uniqueId);
    
    Object.assign(studentProgress, updateStudentProgressDto);
    return await this.studentProgressRepository.save(studentProgress);
  }

  async updateProgress(uniqueId: string, progressData: {
    overallProgress?: number;
    gpa?: number;
    creditsCompleted?: number;
    attendancePercentage?: number;
    assignmentsPercentage?: number;
    examsPercentage?: number;
    participationPercentage?: number;
  }): Promise<StudentProgress> {
    const studentProgress = await this.findOne(uniqueId);
    
    Object.assign(studentProgress, progressData);
    return await this.studentProgressRepository.save(studentProgress);
  }

  async getProgressStats(): Promise<{
    totalStudents: number;
    activeStudents: number;
    completedStudents: number;
    averageProgress: number;
    averageGPA: number;
  }> {
    const totalStudents = await this.studentProgressRepository.count();
    const activeStudents = await this.studentProgressRepository.count({ where: { status: 'active' } });
    const completedStudents = await this.studentProgressRepository.count({ where: { status: 'completed' } });

    const allProgress = await this.studentProgressRepository.find();
    const averageProgress = allProgress.reduce((sum, sp) => sum + Number(sp.overallProgress), 0) / totalStudents || 0;
    const averageGPA = allProgress
      .filter(sp => sp.gpa !== null)
      .reduce((sum, sp) => sum + Number(sp.gpa), 0) / allProgress.filter(sp => sp.gpa !== null).length || 0;

    return {
      totalStudents,
      activeStudents,
      completedStudents,
      averageProgress,
      averageGPA,
    };
  }

  async remove(uniqueId: string): Promise<void> {
    const studentProgress = await this.findOne(uniqueId);
    await this.studentProgressRepository.remove(studentProgress);
  }

  // Automatic progress update methods
  async updateProgressOnActivity(studentEmail: string, activityType: 'assignment' | 'exam' | 'attendance' | 'participation', score?: number): Promise<StudentProgress | null> {
    const studentProgress = await this.studentProgressRepository.findOne({
      where: { studentEmail },
      order: { creationDate: 'DESC' }
    });

    if (!studentProgress) {
      return null;
    }

    let updates: Partial<StudentProgress> = {};

    switch (activityType) {
      case 'assignment':
        if (score !== undefined) {
          // Update assignments percentage based on score
          const currentAssignments = studentProgress.assignmentsPercentage || 0;
          const newAssignments = Math.min(100, currentAssignments + (score * 0.1)); // Weight assignments
          updates.assignmentsPercentage = newAssignments;
        }
        break;
      
      case 'exam':
        if (score !== undefined) {
          // Update exams percentage based on score
          const currentExams = studentProgress.examsPercentage || 0;
          const newExams = Math.min(100, currentExams + (score * 0.15)); // Weight exams more
          updates.examsPercentage = newExams;
        }
        break;
      
      case 'attendance':
        // Update attendance percentage
        const currentAttendance = studentProgress.attendancePercentage || 0;
        const newAttendance = Math.min(100, currentAttendance + 1); // Increment by 1%
        updates.attendancePercentage = newAttendance;
        break;
      
      case 'participation':
        // Update participation percentage
        const currentParticipation = studentProgress.participationPercentage || 0;
        const newParticipation = Math.min(100, currentParticipation + 0.5); // Increment by 0.5%
        updates.participationPercentage = newParticipation;
        break;
    }

    // Calculate overall progress based on all metrics
    const attendance = updates.attendancePercentage || studentProgress.attendancePercentage || 0;
    const assignments = updates.assignmentsPercentage || studentProgress.assignmentsPercentage || 0;
    const exams = updates.examsPercentage || studentProgress.examsPercentage || 0;
    const participation = updates.participationPercentage || studentProgress.participationPercentage || 0;
    
    // Weighted average: attendance 20%, assignments 30%, exams 40%, participation 10%
    const overallProgress = (attendance * 0.2) + (assignments * 0.3) + (exams * 0.4) + (participation * 0.1);
    updates.overallProgress = Math.min(100, overallProgress);

    // Update credits completed based on overall progress
    const creditsCompleted = Math.floor((updates.overallProgress / 100) * studentProgress.totalCredits);
    updates.creditsCompleted = creditsCompleted;

    // Update GPA based on overall performance
    if (updates.overallProgress >= 90) {
      updates.gpa = 4.0;
    } else if (updates.overallProgress >= 80) {
      updates.gpa = 3.5;
    } else if (updates.overallProgress >= 70) {
      updates.gpa = 3.0;
    } else if (updates.overallProgress >= 60) {
      updates.gpa = 2.5;
    } else {
      updates.gpa = 2.0;
    }

    // Update status based on progress
    if (updates.overallProgress >= 100) {
      updates.status = 'completed';
      updates.completionDate = new Date();
    } else if (updates.overallProgress < 30) {
      updates.status = 'inactive';
    } else {
      updates.status = 'active';
    }

    Object.assign(studentProgress, updates);
    return await this.studentProgressRepository.save(studentProgress);
  }

  async createOrUpdateProgress(studentEmail: string, studentName: string, courseName: string, bursaryName: string): Promise<StudentProgress> {
    let studentProgress = await this.studentProgressRepository.findOne({
      where: { studentEmail },
      order: { creationDate: 'DESC' }
    });

    if (!studentProgress) {
      // Create new progress record
      studentProgress = this.studentProgressRepository.create({
        uniqueId: `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        studentEmail,
        studentName,
        courseName,
        bursaryName,
        overallProgress: 0,
        creditsCompleted: 0,
        totalCredits: 120,
        attendancePercentage: 0,
        assignmentsPercentage: 0,
        examsPercentage: 0,
        participationPercentage: 0,
        status: 'active',
        enrollmentDate: new Date(),
      });
    } else {
      // Update existing record
      studentProgress.studentName = studentName;
      studentProgress.courseName = courseName;
      studentProgress.bursaryName = bursaryName;
    }

    return await this.studentProgressRepository.save(studentProgress);
  }
}

