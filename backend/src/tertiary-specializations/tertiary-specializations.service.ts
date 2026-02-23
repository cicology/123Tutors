import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TertiarySpecialization } from './tertiary-specializations.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';

@Injectable()
export class TertiarySpecializationsService {
  constructor(
    @InjectRepository(TertiarySpecialization)
    private readonly tertiarySpecializationsRepository: Repository<TertiarySpecialization>,
  ) {}

  async findAll(paginationDto: PaginationDto, searchDto: SearchDto): Promise<{ data: TertiarySpecialization[]; total: number }> {
    const { page, limit } = paginationDto;
    const { search, sortBy, sortOrder } = searchDto;

    const queryBuilder = this.tertiarySpecializationsRepository.createQueryBuilder('tertiarySpecializations');

    if (search) {
      queryBuilder.where(
        'tertiarySpecializations.uniqueId ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      queryBuilder.orderBy(`tertiarySpecializations.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('tertiarySpecializations.creationDate', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(uniqueId: string): Promise<TertiarySpecialization> {
    const tertiarySpecializations = await this.tertiarySpecializationsRepository.findOne({
      where: { uniqueId },
    });

    if (!tertiarySpecializations) {
      throw new NotFoundException(`TertiarySpecialization with unique ID ${uniqueId} not found`);
    }

    return tertiarySpecializations;
  }
}