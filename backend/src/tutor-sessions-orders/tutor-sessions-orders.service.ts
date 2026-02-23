import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TutorSessionsOrder } from './tutor-sessions-orders.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';

@Injectable()
export class TutorSessionsOrdersService {
  constructor(
    @InjectRepository(TutorSessionsOrder)
    private readonly tutorSessionsOrdersRepository: Repository<TutorSessionsOrder>,
  ) {}

  async findAll(paginationDto: PaginationDto, searchDto: SearchDto): Promise<{ data: TutorSessionsOrder[]; total: number }> {
    const { page, limit } = paginationDto;
    const { search, sortBy, sortOrder } = searchDto;

    const queryBuilder = this.tutorSessionsOrdersRepository.createQueryBuilder('tutorSessionsOrders');

    if (search) {
      queryBuilder.where(
        'tutorSessionsOrders.uniqueId ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      queryBuilder.orderBy(`tutorSessionsOrders.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('tutorSessionsOrders.creationDate', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(uniqueId: string): Promise<TutorSessionsOrder> {
    const tutorSessionsOrders = await this.tutorSessionsOrdersRepository.findOne({
      where: { uniqueId },
    });

    if (!tutorSessionsOrders) {
      throw new NotFoundException(`TutorSessionsOrder with unique ID ${uniqueId} not found`);
    }

    return tutorSessionsOrders;
  }
}