import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ 
    summary: 'Register as a tutor',
    description: 'Register a new tutor account. The tutor will be in PENDING status until approved.'
  })
  @ApiBody({ type: CreateTutorDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Tutor registration successful',
    schema: {
      type: 'object',
      properties: {
        tutor: { type: 'object' },
        message: { type: 'string', example: 'Tutor application submitted successfully. Awaiting approval.' }
      }
    }
  })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(@Body() createTutorDto: CreateTutorDto) {
    return this.authService.register(createTutorDto);
  }

  @Post('register/student')
  @ApiOperation({ 
    summary: 'Register as a student',
    description: 'Register a new student account. Students can later apply to become tutors.'
  })
  @ApiBody({ type: CreateStudentDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Student registration successful',
    schema: {
      type: 'object',
      properties: {
        student: { type: 'object' },
        message: { type: 'string', example: 'Student account created successfully.' }
      }
    }
  })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async registerStudent(@Body() createStudentDto: CreateStudentDto) {
    return this.authService.registerStudent(createStudentDto);
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'Login',
    description: 'Login with email and password. Returns JWT token for authenticated requests. Works for both tutors and students.'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        user: { type: 'object' },
        roles: { type: 'array', items: { type: 'string' } },
        isTutor: { type: 'boolean' },
        isStudent: { type: 'boolean' },
        tutorId: { type: 'string', nullable: true },
        studentId: { type: 'string', nullable: true },
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get current user',
    description: 'Returns the currently authenticated user information based on JWT token.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        type: { type: 'string', example: 'tutor' },
        roles: { type: 'array' },
        tutorId: { type: 'string', nullable: true },
        studentId: { type: 'string', nullable: true },
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() tutor: any) {
    return tutor;
  }
}

