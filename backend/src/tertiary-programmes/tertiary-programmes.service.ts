import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TertiaryProgramme } from './tertiary-programmes.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';

@Injectable()
export class TertiaryProgrammesService {
  constructor(
    @InjectRepository(TertiaryProgramme)
    private readonly tertiaryProgrammeRepository: Repository<TertiaryProgramme>,
  ) {}

  async findAll(paginationDto: PaginationDto, searchDto: SearchDto): Promise<{ data: TertiaryProgramme[]; total: number }> {
    const { page, limit } = paginationDto;
    const { search, sortBy, sortOrder } = searchDto;

    const queryBuilder = this.tertiaryProgrammeRepository.createQueryBuilder('tertiaryProgramme');

    if (search) {
      queryBuilder.where(
        'tertiaryProgramme.tertiaryProgramme ILIKE :search OR tertiaryProgramme.uniqueId ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      queryBuilder.orderBy(`tertiaryProgramme.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('tertiaryProgramme.creationDate', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(uniqueId: string): Promise<TertiaryProgramme> {
    const tertiaryProgramme = await this.tertiaryProgrammeRepository.findOne({
      where: { uniqueId },
    });

    if (!tertiaryProgramme) {
      throw new NotFoundException(`Tertiary programme with unique ID ${uniqueId} not found`);
    }

    return tertiaryProgramme;
  }
}
