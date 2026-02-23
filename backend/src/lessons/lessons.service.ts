import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './lessons.entity';
import { CreateLessonDto, UpdateLessonDto } from './dto/create-lesson.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const lesson = this.lessonRepository.create(createLessonDto);
    return await this.lessonRepository.save(lesson);
  }

  async findAll(
    paginationDto: PaginationDto,
    searchDto: SearchDto,
  ): Promise<{ data: Lesson[]; total: number }> {
    const { page = 1, limit = 10 } = paginationDto;
    const { search = '' } = searchDto;

    const queryBuilder = this.lessonRepository.createQueryBuilder('lesson');

    if (search) {
      queryBuilder.where(
        'lesson.title ILIKE :search OR lesson.description ILIKE :search OR lesson.courseName ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('lesson.creationDate', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(uniqueId: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { uniqueId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${uniqueId} not found`);
    }

    return lesson;
  }

  async findByCourseId(courseId: string): Promise<Lesson[]> {
    return await this.lessonRepository.find({
      where: { courseId },
      order: { creationDate: 'DESC' },
    });
  }

  async findByStatus(status: string): Promise<Lesson[]> {
    return await this.lessonRepository.find({
      where: { status: status as any },
      order: { creationDate: 'DESC' },
    });
  }

  async findByBursaryName(bursaryName: string): Promise<Lesson[]> {
    return await this.lessonRepository.find({
      where: { bursaryName },
      order: { creationDate: 'DESC' },
    });
  }

  async update(uniqueId: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.findOne(uniqueId);
    
    Object.assign(lesson, updateLessonDto);
    return await this.lessonRepository.save(lesson);
  }

  async publishLesson(uniqueId: string): Promise<Lesson> {
    const lesson = await this.findOne(uniqueId);
    lesson.status = 'published';
    return await this.lessonRepository.save(lesson);
  }

  async archiveLesson(uniqueId: string): Promise<Lesson> {
    const lesson = await this.findOne(uniqueId);
    lesson.status = 'archived';
    return await this.lessonRepository.save(lesson);
  }

  async updateEnrollment(uniqueId: string, enrolledCount: number): Promise<Lesson> {
    const lesson = await this.findOne(uniqueId);
    lesson.studentsEnrolled = enrolledCount;
    return await this.lessonRepository.save(lesson);
  }

  async updateCompletionRate(uniqueId: string, completionRate: number): Promise<Lesson> {
    const lesson = await this.findOne(uniqueId);
    lesson.completionRate = completionRate;
    return await this.lessonRepository.save(lesson);
  }

  async getLessonStats(): Promise<{
    totalLessons: number;
    publishedLessons: number;
    draftLessons: number;
    archivedLessons: number;
    totalEnrollments: number;
    averageCompletionRate: number;
  }> {
    const totalLessons = await this.lessonRepository.count();
    const publishedLessons = await this.lessonRepository.count({ where: { status: 'published' } });
    const draftLessons = await this.lessonRepository.count({ where: { status: 'draft' } });
    const archivedLessons = await this.lessonRepository.count({ where: { status: 'archived' } });

    const allLessons = await this.lessonRepository.find();
    const totalEnrollments = allLessons.reduce((sum, lesson) => sum + lesson.studentsEnrolled, 0);
    const averageCompletionRate = allLessons.reduce((sum, lesson) => sum + Number(lesson.completionRate), 0) / totalLessons || 0;

    return {
      totalLessons,
      publishedLessons,
      draftLessons,
      archivedLessons,
      totalEnrollments,
      averageCompletionRate,
    };
  }

  async remove(uniqueId: string): Promise<void> {
    const lesson = await this.findOne(uniqueId);
    await this.lessonRepository.remove(lesson);
  }
}

