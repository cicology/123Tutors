import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './courses.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly coursesRepository: Repository<Course>,
  ) {}

  async findAll(paginationDto: PaginationDto, searchDto: SearchDto): Promise<{ data: Course[]; total: number }> {
    const { page, limit } = paginationDto;
    const { search, sortBy, sortOrder } = searchDto;

    const queryBuilder = this.coursesRepository.createQueryBuilder('courses');

    if (search) {
      queryBuilder.where(
        'courses.uniqueId ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      queryBuilder.orderBy(`courses.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('courses.creationDate', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(uniqueId: string): Promise<Course> {
    const courses = await this.coursesRepository.findOne({
      where: { uniqueId },
    });

    if (!courses) {
      throw new NotFoundException(`Courses with unique ID ${uniqueId} not found`);
    }

    return courses;
  }

  async findActive(): Promise<Course[]> {
    return await this.coursesRepository.find({
      order: { creationDate: 'DESC' },
    });
  }

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.coursesRepository.create(createCourseDto);
    return await this.coursesRepository.save(course);
  }

  async update(uniqueId: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(uniqueId);
    Object.assign(course, updateCourseDto);
    return await this.coursesRepository.save(course);
  }

  async remove(uniqueId: string): Promise<void> {
    const course = await this.findOne(uniqueId);
    await this.coursesRepository.remove(course);
  }
}