import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoCode } from './promo-codes.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';

@Injectable()
export class PromoCodesService {
  constructor(
    @InjectRepository(PromoCode)
    private readonly promoCodesRepository: Repository<PromoCode>,
  ) {}

  async findAll(paginationDto: PaginationDto, searchDto: SearchDto): Promise<{ data: PromoCode[]; total: number }> {
    const { page, limit } = paginationDto;
    const { search, sortBy, sortOrder } = searchDto;

    const queryBuilder = this.promoCodesRepository.createQueryBuilder('promoCodes');

    if (search) {
      queryBuilder.where(
        'promoCodes.uniqueId ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      queryBuilder.orderBy(`promoCodes.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('promoCodes.creationDate', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(uniqueId: string): Promise<PromoCode> {
    const promoCodes = await this.promoCodesRepository.findOne({
      where: { uniqueId },
    });

    if (!promoCodes) {
      throw new NotFoundException(`PromoCodes with unique ID ${uniqueId} not found`);
    }

    return promoCodes;
  }
}