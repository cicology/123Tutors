import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from './user-profiles.entity';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';

@Injectable()
export class UserProfilesService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
  ) {}

  async create(createUserProfileDto: CreateUserProfileDto): Promise<UserProfile> {
    const userProfile = this.userProfileRepository.create(createUserProfileDto);
    return await this.userProfileRepository.save(userProfile);
  }

  async findAll(paginationDto: PaginationDto, searchDto: SearchDto): Promise<{ data: UserProfile[]; total: number }> {
    const { page, limit } = paginationDto;
    const { search, sortBy, sortOrder } = searchDto;

    const queryBuilder = this.userProfileRepository.createQueryBuilder('userProfile');

    if (search) {
      queryBuilder.where(
        'userProfile.email ILIKE :search OR userProfile.userType ILIKE :search OR userProfile.uniqueId ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      queryBuilder.orderBy(`userProfile.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('userProfile.creationDate', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(email: string): Promise<UserProfile> {
    const userProfile = await this.userProfileRepository.findOne({
      where: { email },
      relations: ['bursary'], // Include the bursary relationship
    });

    if (!userProfile) {
      throw new NotFoundException(`User profile with email ${email} not found`);
    }

    return userProfile;
  }

  async findByUniqueId(uniqueId: string): Promise<UserProfile> {
    const userProfile = await this.userProfileRepository.findOne({
      where: { uniqueId },
    });

    if (!userProfile) {
      throw new NotFoundException(`User profile with unique ID ${uniqueId} not found`);
    }

    return userProfile;
  }

  async update(email: string, updateUserProfileDto: UpdateUserProfileDto): Promise<UserProfile> {
    const userProfile = await this.findOne(email);
    
    Object.assign(userProfile, updateUserProfileDto);
    return await this.userProfileRepository.save(userProfile);
  }

  async remove(email: string): Promise<void> {
    const userProfile = await this.findOne(email);
    await this.userProfileRepository.remove(userProfile);
  }

  async findByUserType(userType: string): Promise<UserProfile[]> {
    return await this.userProfileRepository.find({
      where: { userType },
      order: { creationDate: 'DESC' },
    });
  }

  async findByBursaryName(bursaryName: string): Promise<UserProfile[]> {
    return await this.userProfileRepository.find({
      where: { bursaryName },
      relations: ['bursary'], // Include the bursary relationship
      order: { creationDate: 'DESC' },
    });
  }

  async findBursaryAdminsByBursary(bursaryName: string): Promise<UserProfile[]> {
    return await this.userProfileRepository.find({
      where: { 
        userType: 'bursary_admin',
        bursaryName 
      },
      relations: ['bursary'], // Include the bursary relationship
      order: { creationDate: 'DESC' },
    });
  }

  async findUsersWithBursaryDetails(): Promise<UserProfile[]> {
    return await this.userProfileRepository.find({
      relations: ['bursary'],
      order: { creationDate: 'DESC' },
    });
  }

  // New methods for unique_id based bursary identification
  async findUserByUniqueIdWithBursary(uniqueId: string): Promise<UserProfile> {
    const userProfile = await this.userProfileRepository.findOne({
      where: { uniqueId },
      relations: ['bursary'],
    });

    if (!userProfile) {
      throw new NotFoundException(`User profile with unique ID ${uniqueId} not found`);
    }

    return userProfile;
  }

  async findBursaryAdminsByUniqueIdPattern(): Promise<UserProfile[]> {
    // Find all bursary_admin users whose unique_id follows the pattern UP_[BURSARY]_002
    return await this.userProfileRepository.find({
      where: { 
        userType: 'bursary_admin',
      },
      relations: ['bursary'],
      order: { creationDate: 'DESC' },
    });
  }

  async getUserBursaryByUniqueId(userUniqueId: string): Promise<string | null> {
    // Extract bursary from unique_id pattern (e.g., UP_TEST_002 -> Test Bursary)
    const userProfile = await this.findUserByUniqueIdWithBursary(userUniqueId);
    
    if (userProfile.bursary) {
      return userProfile.bursary.bursaryName;
    }
    
    // Fallback: try to extract from unique_id pattern
    const pattern = userUniqueId.match(/^UP_([A-Z]+)_\d+$/);
    if (pattern) {
      const bursaryCode = pattern[1];
      // Map bursary codes to names
      const bursaryMapping: Record<string, string> = {
        'TEST': 'Test Bursary',
        'SAEF': 'South African Education Foundation', 
        'FUNZA': 'FUNZA',
        'NSFAS': 'NSFAS'
      };
      return bursaryMapping[bursaryCode] || null;
    }
    
    return null;
  }

  async findUsersByBursaryUniqueId(bursaryUniqueId: string): Promise<UserProfile[]> {
    // Find users whose bursary relationship matches the bursary unique_id
    return await this.userProfileRepository
      .createQueryBuilder('userProfile')
      .leftJoinAndSelect('userProfile.bursary', 'bursary')
      .where('bursary.uniqueId = :bursaryUniqueId', { bursaryUniqueId })
      .orderBy('userProfile.creationDate', 'DESC')
      .getMany();
  }
}
