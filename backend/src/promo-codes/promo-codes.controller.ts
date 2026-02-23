import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PromoCodesService } from './promo-codes.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';
import { PromoCode } from './promo-codes.entity';

@ApiTags('PromoCode')
@Controller('promo-codes')
export class PromoCodesController {
  constructor(private readonly promoCodesService: PromoCodesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all promo-codes with pagination and search' })
  @ApiResponse({ status: 200, description: 'promo-codes retrieved successfully' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() searchDto: SearchDto,
  ): Promise<{ data: PromoCode[]; total: number }> {
    return await this.promoCodesService.findAll(paginationDto, searchDto);
  }

  @Get(':uniqueId')
  @ApiOperation({ summary: 'Get promo-codes by unique ID' })
  @ApiResponse({ status: 200, description: 'promo-codes retrieved successfully', type: PromoCode })
  @ApiResponse({ status: 404, description: 'promo-codes not found' })
  async findOne(@Param('uniqueId') uniqueId: string): Promise<PromoCode> {
    return await this.promoCodesService.findOne(uniqueId);
  }
}