import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bank } from './bank.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';

@Injectable()
export class BankService {
  constructor(
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
  ) {}

  async findAll(paginationDto: PaginationDto, searchDto: SearchDto): Promise<{ data: Bank[]; total: number }> {
    const { page, limit } = paginationDto;
    const { search, sortBy, sortOrder } = searchDto;

    const queryBuilder = this.bankRepository.createQueryBuilder('bank');

    if (search) {
      queryBuilder.where(
        'bank.bankName ILIKE :search OR bank.branchCode ILIKE :search OR bank.uniqueId ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      queryBuilder.orderBy(`bank.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('bank.creationDate', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(uniqueId: string): Promise<Bank> {
    const bank = await this.bankRepository.findOne({
      where: { uniqueId },
    });

    if (!bank) {
      throw new NotFoundException(`Bank with unique ID ${uniqueId} not found`);
    }

    return bank;
  }
}
