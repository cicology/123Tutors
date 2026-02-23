import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TertiaryName } from './tertiary-names.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';

@Injectable()
export class TertiaryNamesService {
  constructor(
    @InjectRepository(TertiaryName)
    private readonly tertiaryNameRepository: Repository<TertiaryName>,
  ) {}

  async findAll(paginationDto: PaginationDto, searchDto: SearchDto): Promise<{ data: TertiaryName[]; total: number }> {
    const { page, limit } = paginationDto;
    const { search, sortBy, sortOrder } = searchDto;

    const queryBuilder = this.tertiaryNameRepository.createQueryBuilder('tertiaryName');

    if (search) {
      queryBuilder.where(
        'tertiaryName.tertiaryName ILIKE :search OR tertiaryName.tertiaryCodes ILIKE :search OR tertiaryName.uniqueId ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      queryBuilder.orderBy(`tertiaryName.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('tertiaryName.creationDate', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(uniqueId: string): Promise<TertiaryName> {
    const tertiaryName = await this.tertiaryNameRepository.findOne({
      where: { uniqueId },
    });

    if (!tertiaryName) {
      throw new NotFoundException(`Tertiary institution with unique ID ${uniqueId} not found`);
    }

    return tertiaryName;
  }
}
