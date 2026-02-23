import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { BursaryNamesService } from './bursary-names.service';
import { CreateBursaryNameDto } from './dto/create-bursary-name.dto';
import { UpdateBursaryNameDto } from './dto/update-bursary-name.dto';
import { PaginationSearchDto } from '../common/dto/pagination-search.dto';
import { BursaryName } from './bursary-names.entity';
import { StorageService } from '../common/storage/storage.service';

@ApiTags('Bursary Names')
@Controller('bursary-names')
export class BursaryNamesController {
  constructor(
    private readonly bursaryNamesService: BursaryNamesService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bursary organization' })
  @ApiResponse({ status: 201, description: 'Bursary created successfully', type: BursaryName })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createBursaryNameDto: CreateBursaryNameDto): Promise<BursaryName> {
    return await this.bursaryNamesService.create(createBursaryNameDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bursary organizations with pagination and search' })
  @ApiResponse({ status: 200, description: 'Bursaries retrieved successfully' })
  async findAll(
    @Query() paginationSearchDto: PaginationSearchDto,
  ): Promise<{ data: BursaryName[]; total: number }> {
    return await this.bursaryNamesService.findAll(paginationSearchDto, paginationSearchDto);
  }

  @Get(':uniqueId')
  @ApiOperation({ summary: 'Get bursary organization by unique ID' })
  @ApiResponse({ status: 200, description: 'Bursary retrieved successfully', type: BursaryName })
  @ApiResponse({ status: 404, description: 'Bursary not found' })
  async findOne(@Param('uniqueId') uniqueId: string): Promise<BursaryName> {
    return await this.bursaryNamesService.findOne(uniqueId);
  }

  @Get('name/:bursaryName')
  @ApiOperation({ summary: 'Get bursary organization by name' })
  @ApiResponse({ status: 200, description: 'Bursary retrieved successfully', type: BursaryName })
  @ApiResponse({ status: 404, description: 'Bursary not found' })
  async findByName(@Param('bursaryName') bursaryName: string): Promise<BursaryName> {
    return await this.bursaryNamesService.findByName(bursaryName);
  }

  @Get(':uniqueId/stats')
  @ApiOperation({ summary: 'Get bursary organization statistics' })
  @ApiResponse({ status: 200, description: 'Bursary statistics retrieved successfully' })
  async getBursaryStats(@Param('uniqueId') uniqueId: string): Promise<{
    totalStudents: number;
    totalRequests: number;
    activeRequests: number;
    totalBudget: number;
    usedBudget: number;
  }> {
    return await this.bursaryNamesService.getBursaryStats(uniqueId);
  }

  @Patch(':uniqueId')
  @ApiOperation({ summary: 'Update bursary organization' })
  @ApiResponse({ status: 200, description: 'Bursary updated successfully', type: BursaryName })
  @ApiResponse({ status: 404, description: 'Bursary not found' })
  async update(
    @Param('uniqueId') uniqueId: string,
    @Body() updateBursaryNameDto: UpdateBursaryNameDto,
  ): Promise<BursaryName> {
    return await this.bursaryNamesService.update(uniqueId, updateBursaryNameDto);
  }

  @Delete(':uniqueId')
  @ApiOperation({ summary: 'Delete bursary organization' })
  @ApiResponse({ status: 200, description: 'Bursary deleted successfully' })
  @ApiResponse({ status: 404, description: 'Bursary not found' })
  async remove(@Param('uniqueId') uniqueId: string): Promise<{ message: string }> {
    await this.bursaryNamesService.remove(uniqueId);
    return { message: 'Bursary deleted successfully' };
  }

  @Post('upload-logo')
  @UseInterceptors(FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload bursary logo' })
  @ApiResponse({ status: 200, description: 'Logo uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async uploadLogo(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ logoUrl: string }> {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    try {
      // Upload to Supabase Storage - uses the same S3 bucket as profile images
      // Files are organized in the 'bursary-logos' folder within the same bucket
      const logoUrl = await this.storageService.uploadFile(file, 'bursary-logos');
      
      return { logoUrl };
    } catch (error) {
      console.error('Error uploading bursary logo:', error);
      throw new Error('Failed to upload logo');
    }
  }
}
