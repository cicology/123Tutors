import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { TutorsService } from '../tutors/tutors.service';
import { ReferralsService } from '../referrals/referrals.service';
import { CreateTutorDto } from './dto/create-tutor.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { LoginDto } from './dto/login.dto';
import { Student } from './entities/student.entity';

@Injectable()
export class AuthService {
  constructor(
    private tutorsService: TutorsService,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    private referralsService: ReferralsService,
    private jwtService: JwtService,
  ) {}

  async register(createTutorDto: CreateTutorDto) {
    const existingTutor = await this.tutorsService.findByEmail(createTutorDto.email);
    if (existingTutor) {
      throw new ConflictException('Email already registered');
    }

    // Process referral code if provided
    if (createTutorDto.referralCode) {
      await this.referralsService.processReferralCode(createTutorDto.referralCode, createTutorDto.email);
    }

    const hashedPassword = await bcrypt.hash(createTutorDto.password, 10);
    const tutor = await this.tutorsService.create({
      ...createTutorDto,
      password: hashedPassword,
    });

    return {
      tutor: this.tutorsService.sanitizeTutor(tutor),
      message: 'Tutor application submitted successfully. Awaiting approval.',
    };
  }

  async registerStudent(createStudentDto: CreateStudentDto) {
    // Check if email already exists in student table
    const existingStudent = await this.studentRepository.findOne({
      where: { email: createStudentDto.email },
    });
    if (existingStudent) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(createStudentDto.password, 10);
    const student = this.studentRepository.create({
      ...createStudentDto,
      password: hashedPassword,
    });
    const savedStudent = await this.studentRepository.save(student);

    // Sanitize student (remove password)
    const { password, ...studentWithoutPassword } = savedStudent;

    return {
      student: studentWithoutPassword,
      message: 'Student account created successfully.',
    };
  }

  async login(loginDto: LoginDto) {
    // Check both student and tutor tables
    const tutor = await this.tutorsService.findByEmail(loginDto.email);
    const student = await this.studentRepository.findOne({
      where: { email: loginDto.email },
    });

    let user: any = null;
    let userType: 'tutor' | 'student' = 'student';
    let roles: string[] = [];
    let tutorPasswordValid = false;
    let studentPasswordValid = false;

    // Check tutor password
    if (tutor) {
      tutorPasswordValid = await bcrypt.compare(loginDto.password, tutor.password);
    }

    // Check student password
    if (student) {
      studentPasswordValid = await bcrypt.compare(loginDto.password, student.password);
    }

    // If neither password matches, throw error
    if (!tutorPasswordValid && !studentPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Add roles based on which passwords match
    if (tutorPasswordValid) {
      roles.push('tutor');
      user = this.tutorsService.sanitizeTutor(tutor);
      userType = 'tutor';
    }

    if (studentPasswordValid) {
      roles.push('student');
      // If user is only a student (no tutor match), set user data
      if (!tutorPasswordValid) {
        // Sanitize student (remove password)
        const { password, ...studentWithoutPassword } = student;
        user = studentWithoutPassword;
        userType = 'student';
      }
    }

    // Determine primary user ID and email
    const userId = tutorPasswordValid ? tutor.id : student.id;
    const email = tutor?.email || student?.email;

    const payload = { 
      email, 
      sub: userId,
      type: userType,
      roles,
      tutorId: tutor?.id || null,
      studentId: student?.id || null,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: user,
      roles,
      isTutor: roles.includes('tutor'),
      isStudent: roles.includes('student'),
      tutorId: tutor?.id || null,
      studentId: student?.id || null,
    };
  }
}

