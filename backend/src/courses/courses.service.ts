import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async create(tutorId: string, createCourseDto: CreateCourseDto): Promise<Course> {
    // Ensure course is active by default so it appears to students immediately
    const course = this.courseRepository.create({
      ...createCourseDto,
      tutorId,
      isActive: createCourseDto.isActive !== undefined ? createCourseDto.isActive : true,
    });
    return this.courseRepository.save(course);
  }

  async findAll(tutorId: string): Promise<Course[]> {
    return this.courseRepository.find({
      where: { tutorId },
      relations: ['lessons', 'tutor'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllAvailable(excludeTutorId?: string): Promise<Course[]> {
    const query = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.tutor', 'tutor')
      .where('course.isActive = :isActive', { isActive: true })
      .andWhere('tutor.status = :status', { status: 'approved' });
    
    // Exclude courses created by the specified tutor (when user is viewing as student)
    if (excludeTutorId) {
      query.andWhere('course.tutorId != :excludeTutorId', { excludeTutorId });
    }
    
    return query
      .orderBy('course.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string, tutorId: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['lessons', 'tutor'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.tutorId !== tutorId) {
      throw new ForbiddenException('You do not have access to this course');
    }

    return course;
  }

  async update(id: string, tutorId: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id, tutorId);
    Object.assign(course, updateCourseDto);
    return this.courseRepository.save(course);
  }

  async remove(id: string, tutorId: string): Promise<void> {
    const course = await this.findOne(id, tutorId);
    await this.courseRepository.remove(course);
  }
}

