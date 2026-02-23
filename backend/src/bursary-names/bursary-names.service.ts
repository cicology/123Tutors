import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BursaryName } from './bursary-names.entity';
import { CreateBursaryNameDto } from './dto/create-bursary-name.dto';
import { UpdateBursaryNameDto } from './dto/update-bursary-name.dto';
import { PaginationSearchDto } from '../common/dto/pagination-search.dto';

@Injectable()
export class BursaryNamesService {
  constructor(
    @InjectRepository(BursaryName)
    private readonly bursaryNameRepository: Repository<BursaryName>,
  ) {}

  async create(createBursaryNameDto: CreateBursaryNameDto): Promise<BursaryName> {
    // Generate unique ID if not provided
    const uniqueId = createBursaryNameDto.uniqueId || `BN_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    // Generate slug if not provided
    const slug = createBursaryNameDto.slug || createBursaryNameDto.bursaryName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Create bursary name with generated fields
    const bursaryName = this.bursaryNameRepository.create({
      ...createBursaryNameDto,
      uniqueId,
      slug,
      creator: createBursaryNameDto.creator || 'system',
    });
    
    return await this.bursaryNameRepository.save(bursaryName);
  }

  async findAll(paginationSearchDto: PaginationSearchDto, searchDto: PaginationSearchDto): Promise<{ data: BursaryName[]; total: number }> {
    const { page, limit } = paginationSearchDto;
    const { search, sortBy, sortOrder } = searchDto;

    const queryBuilder = this.bursaryNameRepository.createQueryBuilder('bursaryName');

    if (search) {
      queryBuilder.where(
        'bursaryName.bursaryName ILIKE :search OR bursaryName.address ILIKE :search OR bursaryName.uniqueId ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      queryBuilder.orderBy(`bursaryName.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('bursaryName.creationDate', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(uniqueId: string): Promise<BursaryName> {
    const bursaryName = await this.bursaryNameRepository.findOne({
      where: { uniqueId },
      relations: ['bursaryStudents', 'tutorRequests'],
    });

    if (!bursaryName) {
      throw new NotFoundException(`Bursary with unique ID ${uniqueId} not found`);
    }

    return bursaryName;
  }

  async findByName(bursaryName: string): Promise<BursaryName> {
    const bursary = await this.bursaryNameRepository.findOne({
      where: { bursaryName },
      relations: ['bursaryStudents', 'tutorRequests'],
    });

    if (!bursary) {
      throw new NotFoundException(`Bursary with name ${bursaryName} not found`);
    }

    return bursary;
  }

  async update(uniqueId: string, updateBursaryNameDto: UpdateBursaryNameDto): Promise<BursaryName> {
    const bursaryName = await this.findOne(uniqueId);
    
    Object.assign(bursaryName, updateBursaryNameDto);
    return await this.bursaryNameRepository.save(bursaryName);
  }

  async remove(uniqueId: string): Promise<void> {
    const bursaryName = await this.findOne(uniqueId);
    await this.bursaryNameRepository.remove(bursaryName);
  }

  async getBursaryStats(uniqueId: string): Promise<{
    totalStudents: number;
    totalRequests: number;
    activeRequests: number;
    totalBudget: number;
    usedBudget: number;
  }> {
    const bursary = await this.findOne(uniqueId);
    
    const totalStudents = bursary.bursaryStudents?.length || 0;
    const totalRequests = bursary.tutorRequests?.length || 0;
    const activeRequests = bursary.tutorRequests?.filter(req => !req.paid && !req.requestDelete).length || 0;
    
    // Calculate budget stats (these would need to be calculated from related data)
    const totalBudget = bursary.tutorRequests?.reduce((sum, req) => sum + (req.totalAmount || 0), 0) || 0;
    const usedBudget = bursary.tutorRequests?.filter(req => req.paid).reduce((sum, req) => sum + (req.totalAmount || 0), 0) || 0;

    return {
      totalStudents,
      totalRequests,
      activeRequests,
      totalBudget,
      usedBudget,
    };
  }
}
