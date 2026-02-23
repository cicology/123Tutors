import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BankService } from './bank.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';
import { Bank } from './bank.entity';

@ApiTags('Bank')
@Controller('bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Get()
  @ApiOperation({ summary: 'Get all banks with pagination and search' })
  @ApiResponse({ status: 200, description: 'Banks retrieved successfully' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() searchDto: SearchDto,
  ): Promise<{ data: Bank[]; total: number }> {
    return await this.bankService.findAll(paginationDto, searchDto);
  }

  @Get(':uniqueId')
  @ApiOperation({ summary: 'Get bank by unique ID' })
  @ApiResponse({ status: 200, description: 'Bank retrieved successfully', type: Bank })
  @ApiResponse({ status: 404, description: 'Bank not found' })
  async findOne(@Param('uniqueId') uniqueId: string): Promise<Bank> {
    return await this.bankService.findOne(uniqueId);
  }
}
