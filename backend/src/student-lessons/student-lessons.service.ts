import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentLesson } from './student-lessons.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';
import { CreateStudentLessonDto } from './dto/create-student-lesson.dto';
import { UpdateStudentLessonDto } from './dto/update-student-lesson.dto';

@Injectable()
export class StudentLessonsService {
  constructor(
    @InjectRepository(StudentLesson)
    private readonly studentLessonsRepository: Repository<StudentLesson>,
  ) {}

  async findAll(paginationDto: PaginationDto, searchDto: SearchDto): Promise<{ data: StudentLesson[]; total: number }> {
    const { page, limit } = paginationDto;
    const { search, sortBy, sortOrder } = searchDto;

    const queryBuilder = this.studentLessonsRepository.createQueryBuilder('studentLessons');

    if (search) {
      queryBuilder.where(
        'studentLessons.uniqueId ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      queryBuilder.orderBy(`studentLessons.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('studentLessons.creationDate', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(uniqueId: string): Promise<StudentLesson> {
    const studentLessons = await this.studentLessonsRepository.findOne({
      where: { uniqueId },
    });

    if (!studentLessons) {
      throw new NotFoundException(`StudentLesson with unique ID ${uniqueId} not found`);
    }

    return studentLessons;
  }

  async findPublished(): Promise<StudentLesson[]> {
    return await this.studentLessonsRepository.find({
      where: { adminLessonApproved: true },
      order: { creationDate: 'DESC' },
    });
  }

  async findDraft(): Promise<StudentLesson[]> {
    return await this.studentLessonsRepository.find({
      where: { adminLessonApproved: false },
      order: { creationDate: 'DESC' },
    });
  }

  async create(createStudentLessonDto: CreateStudentLessonDto): Promise<StudentLesson> {
    const studentLesson = this.studentLessonsRepository.create(createStudentLessonDto);
    return await this.studentLessonsRepository.save(studentLesson);
  }

  async update(uniqueId: string, updateStudentLessonDto: UpdateStudentLessonDto): Promise<StudentLesson> {
    const studentLesson = await this.findOne(uniqueId);
    Object.assign(studentLesson, updateStudentLessonDto);
    return await this.studentLessonsRepository.save(studentLesson);
  }

  async remove(uniqueId: string): Promise<void> {
    const studentLesson = await this.findOne(uniqueId);
    await this.studentLessonsRepository.remove(studentLesson);
  }
}