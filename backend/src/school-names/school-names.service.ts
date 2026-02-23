import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolName } from './school-names.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';

@Injectable()
export class SchoolNamesService {
  constructor(
    @InjectRepository(SchoolName)
    private readonly schoolNameRepository: Repository<SchoolName>,
  ) {}

  async findAll(paginationDto: PaginationDto, searchDto: SearchDto): Promise<{ data: SchoolName[]; total: number }> {
    const { page, limit } = paginationDto;
    const { search, sortBy, sortOrder } = searchDto;

    const queryBuilder = this.schoolNameRepository.createQueryBuilder('schoolName');

    if (search) {
      queryBuilder.where(
        'schoolName.schoolNames ILIKE :search OR schoolName.schoolType ILIKE :search OR schoolName.uniqueId ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      queryBuilder.orderBy(`schoolName.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('schoolName.creationDate', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(uniqueId: string): Promise<SchoolName> {
    const schoolName = await this.schoolNameRepository.findOne({
      where: { uniqueId },
    });

    if (!schoolName) {
      throw new NotFoundException(`School with unique ID ${uniqueId} not found`);
    }

    return schoolName;
  }
}
