import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TutorsService } from './tutors.service';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApplyTutorDto } from './dto/apply-tutor.dto';

@ApiTags('Tutors')
@Controller('tutors')
export class TutorsController {
  constructor(private readonly tutorsService: TutorsService) {}

  @Get('marketplace')
  @ApiOperation({ 
    summary: 'Get all approved tutors for marketplace',
    description: 'Returns a list of all approved tutors that can be displayed in the marketplace. This endpoint is public and does not require authentication.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved marketplace tutors',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid' },
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          subjects: { type: 'string', example: 'Mathematics, Physics' },
          rating: { type: 'number', example: 4.5 },
          location: { type: 'string', example: 'Cape Town' },
          status: { type: 'string', example: 'approved' },
        }
      }
    }
  })
  async getMarketplaceTutors() {
    return this.tutorsService.getMarketplaceTutors();
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get tutor dashboard data',
    description: 'Returns comprehensive dashboard data for the authenticated tutor including statistics, pending requests, upcoming lessons, and recent activity.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved dashboard data',
    schema: {
      type: 'object',
      properties: {
        tutor: { type: 'object' },
        pendingRequests: { type: 'number', example: 5 },
        upcomingLessons: { type: 'number', example: 3 },
        totalStudents: { type: 'number', example: 12 },
        totalEarnings: { type: 'number', example: 5000 },
        recentPayments: { type: 'array' },
        recentRequests: { type: 'array' },
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Tutor role required' })
  async getDashboard(@CurrentUser() user: any) {
    // Get tutorId from JWT payload - it's set during login if user has tutor role
    let tutorId = user?.tutorId;
    
    // If tutorId is not in JWT but user has tutor role, try to find by email
    if (!tutorId && user?.email && user?.roles?.includes('tutor')) {
      const tutor = await this.tutorsService.findByEmail(user.email);
      if (tutor) {
        tutorId = tutor.id;
      }
    }
    
    // Final fallback to user.id if it's a tutor account
    if (!tutorId) {
      tutorId = user?.id;
    }
    
    if (!tutorId) {
      throw new UnauthorizedException('Tutor role required');
    }
    
    return this.tutorsService.getDashboardData(tutorId);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get tutor profile',
    description: 'Returns the profile information of the authenticated tutor. Password and sensitive information are excluded.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved tutor profile',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        email: { type: 'string', example: 'tutor@example.com' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        phone: { type: 'string', example: '+27123456789' },
        location: { type: 'string', example: 'Cape Town' },
        subjects: { type: 'string', example: 'Mathematics, Physics' },
        qualifications: { type: 'string', example: 'BSc Mathematics' },
        experience: { type: 'string', example: '5 years teaching experience' },
        rating: { type: 'number', example: 4.5 },
        status: { type: 'string', example: 'approved' },
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Tutor role required' })
  async getProfile(@CurrentUser() user: any) {
    const tutorId = user?.tutorId || user?.id;
    if (!tutorId) {
      throw new UnauthorizedException('Tutor role required');
    }
    const tutorData = await this.tutorsService.findOne(tutorId);
    return this.tutorsService.sanitizeTutor(tutorData);
  }

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Apply as a tutor',
    description: 'Allows a student to apply to become a tutor. The application will be pending until admin approval.'
  })
  @ApiBody({ 
    type: ApplyTutorDto,
    description: 'Tutor application details',
    examples: {
      example1: {
        summary: 'Basic tutor application',
        value: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+27123456789',
          location: 'Cape Town',
          subjects: 'Mathematics, Physics',
          qualifications: 'BSc Mathematics, Teaching Certificate',
          experience: '5 years of teaching experience',
          referralCode: 'REF123' // Optional
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Tutor application submitted successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        status: { type: 'string', example: 'pending' },
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Student role required' })
  async applyAsTutor(@CurrentUser() user: any, @Body() applyTutorDto: ApplyTutorDto) {
    const studentId = user?.studentId || (user?.roles?.includes('student') ? user?.id : null);
    if (!studentId) {
      throw new UnauthorizedException('Student role required');
    }
    const tutor = await this.tutorsService.applyFromStudent(studentId, applyTutorDto);
    return this.tutorsService.sanitizeTutor(tutor);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Update tutor profile',
    description: 'Updates the profile information of the authenticated tutor. Only provided fields will be updated.'
  })
  @ApiBody({ 
    type: UpdateTutorDto,
    description: 'Tutor profile update data',
    examples: {
      example1: {
        summary: 'Update profile fields',
        value: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+27123456789',
          location: 'Cape Town',
          subjects: 'Mathematics, Physics, Chemistry',
          qualifications: 'BSc Mathematics, MSc Physics',
          experience: '10 years teaching experience',
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        // ... other updated fields
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Tutor role required' })
  async updateProfile(@CurrentUser() tutor: any, @Body() updateDto: UpdateTutorDto) {
    const updated = await this.tutorsService.update(tutor.id, updateDto);
    return this.tutorsService.sanitizeTutor(updated);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get tutor by ID',
    description: 'Returns detailed information about a specific tutor by their ID. Requires authentication.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Tutor UUID',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved tutor information',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        subjects: { type: 'string' },
        rating: { type: 'number' },
        status: { type: 'string' },
        courses: { type: 'array' },
        reviews: { type: 'array' },
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Tutor not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    return this.tutorsService.findOne(id);
  }
}

