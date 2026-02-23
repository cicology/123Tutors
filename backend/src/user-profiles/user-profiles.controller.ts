import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UserProfilesService } from './user-profiles.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';
import { UserProfile } from './user-profiles.entity';
import { StorageService } from '../common/storage/storage.service';

@ApiTags('User Profiles')
@Controller('user-profiles')
export class UserProfilesController {
  constructor(
    private readonly userProfilesService: UserProfilesService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user profile' })
  @ApiResponse({ status: 201, description: 'User profile created successfully', type: UserProfile })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createUserProfileDto: CreateUserProfileDto): Promise<UserProfile> {
    return await this.userProfilesService.create(createUserProfileDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user profiles with pagination and search' })
  @ApiResponse({ status: 200, description: 'User profiles retrieved successfully' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() searchDto: SearchDto,
  ): Promise<{ data: UserProfile[]; total: number }> {
    return await this.userProfilesService.findAll(paginationDto, searchDto);
  }

  @Get('by-type/:userType')
  @ApiOperation({ summary: 'Get user profiles by user type' })
  @ApiResponse({ status: 200, description: 'User profiles retrieved successfully', type: [UserProfile] })
  async findByUserType(@Param('userType') userType: string): Promise<UserProfile[]> {
    return await this.userProfilesService.findByUserType(userType);
  }

  @Get('by-bursary/:bursaryName')
  @ApiOperation({ summary: 'Get user profiles by bursary name' })
  @ApiResponse({ status: 200, description: 'User profiles retrieved successfully', type: [UserProfile] })
  async findByBursaryName(@Param('bursaryName') bursaryName: string): Promise<UserProfile[]> {
    return await this.userProfilesService.findByBursaryName(bursaryName);
  }

  @Get('bursary-admins/:bursaryName')
  @ApiOperation({ summary: 'Get bursary admin users for a specific bursary' })
  @ApiResponse({ status: 200, description: 'Bursary admin users retrieved successfully', type: [UserProfile] })
  async findBursaryAdminsByBursary(@Param('bursaryName') bursaryName: string): Promise<UserProfile[]> {
    return await this.userProfilesService.findBursaryAdminsByBursary(bursaryName);
  }

  @Get('with-bursary-details')
  @ApiOperation({ summary: 'Get all user profiles with bursary relationship details' })
  @ApiResponse({ status: 200, description: 'User profiles with bursary details retrieved successfully', type: [UserProfile] })
  async findUsersWithBursaryDetails(): Promise<UserProfile[]> {
    return await this.userProfilesService.findUsersWithBursaryDetails();
  }

  @Get('bursary-admins-by-unique-id')
  @ApiOperation({ summary: 'Get all bursary admin users with unique ID pattern mapping' })
  @ApiResponse({ status: 200, description: 'Bursary admin users retrieved successfully', type: [UserProfile] })
  async findBursaryAdminsByUniqueIdPattern(): Promise<UserProfile[]> {
    return await this.userProfilesService.findBursaryAdminsByUniqueIdPattern();
  }

  @Get(':email')
  @ApiOperation({ summary: 'Get user profile by email' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully', type: UserProfile })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  async findOne(@Param('email') email: string): Promise<UserProfile> {
    return await this.userProfilesService.findOne(email);
  }

  @Get('unique/:uniqueId')
  @ApiOperation({ summary: 'Get user profile by unique ID' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully', type: UserProfile })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  async findByUniqueId(@Param('uniqueId') uniqueId: string): Promise<UserProfile> {
    return await this.userProfilesService.findByUniqueId(uniqueId);
  }

  @Get('unique/:uniqueId/with-bursary')
  @ApiOperation({ summary: 'Get user profile by unique ID with bursary details' })
  @ApiResponse({ status: 200, description: 'User profile with bursary details retrieved successfully', type: UserProfile })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  async findUserByUniqueIdWithBursary(@Param('uniqueId') uniqueId: string): Promise<UserProfile> {
    return await this.userProfilesService.findUserByUniqueIdWithBursary(uniqueId);
  }

  @Get('unique/:uniqueId/bursary')
  @ApiOperation({ summary: 'Get bursary name for a user by unique ID' })
  @ApiResponse({ status: 200, description: 'Bursary name retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  async getUserBursaryByUniqueId(@Param('uniqueId') uniqueId: string): Promise<{ bursaryName: string | null }> {
    const bursaryName = await this.userProfilesService.getUserBursaryByUniqueId(uniqueId);
    return { bursaryName };
  }

  @Get('by-bursary-unique-id/:bursaryUniqueId')
  @ApiOperation({ summary: 'Get user profiles by bursary unique ID' })
  @ApiResponse({ status: 200, description: 'User profiles retrieved successfully', type: [UserProfile] })
  async findUsersByBursaryUniqueId(@Param('bursaryUniqueId') bursaryUniqueId: string): Promise<UserProfile[]> {
    return await this.userProfilesService.findUsersByBursaryUniqueId(bursaryUniqueId);
  }

  @Patch(':email')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully', type: UserProfile })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  async update(
    @Param('email') email: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<UserProfile> {
    return await this.userProfilesService.update(email, updateUserProfileDto);
  }

  @Delete(':email')
  @ApiOperation({ summary: 'Delete user profile' })
  @ApiResponse({ status: 200, description: 'User profile deleted successfully' })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  async remove(@Param('email') email: string): Promise<{ message: string }> {
    await this.userProfilesService.remove(email);
    return { message: 'User profile deleted successfully' };
  }

  @Post(':email/upload-image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload profile image for user' })
  @ApiResponse({ status: 200, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  async uploadProfileImage(
    @Param('email') email: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ imageUrl: string }> {
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
      // Upload to Supabase Storage
      const imageUrl = await this.storageService.uploadFile(file, 'profile-images');
      
      // Update user profile with new image URL
      await this.userProfilesService.update(email, { profileImageUrl: imageUrl });
      
      return { imageUrl };
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw new Error('Failed to upload image');
    }
  }

  @Post(':email/upload-logo')
  @UseInterceptors(FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload logo for user profile' })
  @ApiResponse({ status: 200, description: 'Logo uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User profile not found' })
  async uploadLogo(
    @Param('email') email: string,
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
      // Upload to Supabase Storage in logos folder
      const logoUrl = await this.storageService.uploadFile(file, 'logos');
      
      // Update user profile with new logo URL
      await this.userProfilesService.update(email, { logoUrl: logoUrl });
      
      return { logoUrl };
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw new Error('Failed to upload logo');
    }
  }
}
