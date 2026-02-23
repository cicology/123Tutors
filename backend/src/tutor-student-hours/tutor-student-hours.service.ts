import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TutorStudentHour } from './tutor-student-hours.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';

@Injectable()
export class TutorStudentHoursService {
  constructor(
    @InjectRepository(TutorStudentHour)
    private readonly tutorStudentHoursRepository: Repository<TutorStudentHour>,
  ) {}

  async findAll(paginationDto: PaginationDto, searchDto: SearchDto): Promise<{ data: TutorStudentHour[]; total: number }> {
    const { page, limit } = paginationDto;
    const { search, sortBy, sortOrder } = searchDto;

    const queryBuilder = this.tutorStudentHoursRepository.createQueryBuilder('tutorStudentHours');

    if (search) {
      queryBuilder.where(
        'tutorStudentHours.uniqueId ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      queryBuilder.orderBy(`tutorStudentHours.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('tutorStudentHours.creationDate', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(uniqueId: string): Promise<TutorStudentHour> {
    const tutorStudentHours = await this.tutorStudentHoursRepository.findOne({
      where: { uniqueId },
    });

    if (!tutorStudentHours) {
      throw new NotFoundException(`TutorStudentHour with unique ID ${uniqueId} not found`);
    }

    return tutorStudentHours;
  }
}