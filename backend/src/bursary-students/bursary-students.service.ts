import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BursaryStudent } from './bursary-students.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';
import { CreateBursaryStudentDto } from './dto/create-bursary-student.dto';
import { UpdateBursaryStudentDto } from './dto/update-bursary-student.dto';
import { BulkUploadStudentDto, BulkUploadResponseDto } from './dto/bulk-upload.dto';
import { StudentProgressService } from '../student-progress/student-progress.service';
import * as XLSX from 'xlsx';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

@Injectable()
export class BursaryStudentsService {
  constructor(
    @InjectRepository(BursaryStudent)
    private readonly bursaryStudentRepository: Repository<BursaryStudent>,
    private readonly dataSource: DataSource,
    private readonly studentProgressService: StudentProgressService,
  ) {}

  async findAll(paginationDto: PaginationDto, searchDto: SearchDto): Promise<{ data: BursaryStudent[]; total: number }> {
    const { page, limit } = paginationDto;
    const { search, sortBy, sortOrder } = searchDto;

    const queryBuilder = this.bursaryStudentRepository.createQueryBuilder('bursaryStudent')
      .leftJoinAndSelect('bursaryStudent.bursaryName', 'bursaryName');

    if (search) {
      queryBuilder.where(
        'bursaryStudent.studentEmail ILIKE :search OR bursaryStudent.studentNameAndSurname ILIKE :search OR bursaryStudent.bursary ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      queryBuilder.orderBy(`bursaryStudent.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('bursaryStudent.creationDate', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(uniqueId: string): Promise<BursaryStudent> {
    const bursaryStudent = await this.bursaryStudentRepository.findOne({
      where: { uniqueId },
      relations: ['bursaryName'],
    });

    if (!bursaryStudent) {
      throw new NotFoundException(`Bursary student with unique ID ${uniqueId} not found`);
    }

    return bursaryStudent;
  }

  async findByBursary(bursary: string): Promise<BursaryStudent[]> {
    // Use case-insensitive matching to handle variations in bursary name
    return await this.bursaryStudentRepository
      .createQueryBuilder('bursaryStudent')
      .where('LOWER(bursaryStudent.bursary) = LOWER(:bursary)', { bursary })
      .leftJoinAndSelect('bursaryStudent.bursaryName', 'bursaryName')
      .orderBy('bursaryStudent.creationDate', 'DESC')
      .getMany();
  }

  async findByStudentEmail(studentEmail: string): Promise<BursaryStudent[]> {
    return await this.bursaryStudentRepository.find({
      where: { studentEmail },
      relations: ['bursaryName'],
      order: { creationDate: 'DESC' },
    });
  }

  async findActive(): Promise<BursaryStudent[]> {
    return await this.bursaryStudentRepository.find({
      where: { studentDisallowed: false },
      relations: ['bursaryName'],
      order: { creationDate: 'DESC' },
    });
  }

  async findCompleted(): Promise<BursaryStudent[]> {
    return await this.bursaryStudentRepository.find({
      where: { studentDisallowed: true },
      relations: ['bursaryName'],
      order: { creationDate: 'DESC' },
    });
  }

  async create(createBursaryStudentDto: CreateBursaryStudentDto): Promise<BursaryStudent> {
    // Generate unique ID
    const uniqueId = `BS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate slug from student email
    const slug = createBursaryStudentDto.studentEmail.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Convert enrollmentDate string to Date if provided
    const enrollmentDate = createBursaryStudentDto.enrollmentDate 
      ? new Date(createBursaryStudentDto.enrollmentDate) 
      : undefined;
    
    // Create bursary student with generated fields
    const bursaryStudent = this.bursaryStudentRepository.create({
      ...createBursaryStudentDto,
      uniqueId,
      slug,
      creator: 'system',
      studentDisallowed: false,
      enrollmentDate,
    });
    
    const savedStudent = await this.bursaryStudentRepository.save(bursaryStudent);
    
    // Automatically create student progress record
    try {
      await this.studentProgressService.createOrUpdateProgress(
        savedStudent.studentEmail,
        savedStudent.studentNameAndSurname,
        savedStudent.course || 'General Studies',
        savedStudent.bursary
      );
    } catch (error) {
      console.error('Failed to create student progress record:', error);
      // Don't fail the student creation if progress record creation fails
    }
    
    return savedStudent;
  }

  async update(uniqueId: string, updateBursaryStudentDto: UpdateBursaryStudentDto): Promise<BursaryStudent> {
    const bursaryStudent = await this.findOne(uniqueId);
    Object.assign(bursaryStudent, updateBursaryStudentDto);
    return await this.bursaryStudentRepository.save(bursaryStudent);
  }

  async remove(uniqueId: string): Promise<void> {
    const bursaryStudent = await this.findOne(uniqueId);
    await this.bursaryStudentRepository.remove(bursaryStudent);
  }

  async disableStudent(uniqueId: string): Promise<BursaryStudent> {
    const bursaryStudent = await this.findOne(uniqueId);
    bursaryStudent.studentDisallowed = true;
    bursaryStudent.status = 'disabled';
    return await this.bursaryStudentRepository.save(bursaryStudent);
  }

  async enableStudent(uniqueId: string): Promise<BursaryStudent> {
    const bursaryStudent = await this.findOne(uniqueId);
    bursaryStudent.studentDisallowed = false;
    bursaryStudent.status = 'active';
    return await this.bursaryStudentRepository.save(bursaryStudent);
  }

  async bulkUploadFromFile(file: Express.Multer.File): Promise<BulkUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    let students: BulkUploadStudentDto[] = [];

    try {
      if (fileExtension === 'csv') {
        students = await this.parseCsvFile(file.buffer);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        students = await this.parseExcelFile(file.buffer);
      } else {
        throw new BadRequestException('Unsupported file format. Please upload CSV or Excel files only.');
      }
    } catch (error) {
      throw new BadRequestException(`Error parsing file: ${error.message}`);
    }

    // Validate references before processing
    const missingReferences = await this.validateReferences(students);
    if (missingReferences.length > 0) {
      throw new BadRequestException({
        message: 'Missing references found',
        missingReferences: missingReferences
      });
    }

    return await this.bulkCreateStudentsWithTransaction(students);
  }

  async bulkUploadFromData(students: BulkUploadStudentDto[]): Promise<BulkUploadResponseDto> {
    // Validate references before processing
    const missingReferences = await this.validateReferences(students);
    if (missingReferences.length > 0) {
      throw new BadRequestException({
        message: 'Missing references found',
        missingReferences: missingReferences
      });
    }

    return await this.bulkCreateStudentsWithTransaction(students);
  }

  private async validateReferences(students: BulkUploadStudentDto[]): Promise<Array<{type: string, name: string, rows: number[]}>> {
    const missingReferences: Array<{type: string, name: string, rows: number[]}> = [];
    
    // Collect unique references
    const courses = new Set<string>();
    const bursaries = new Set<string>();
    const universities = new Set<string>();
    
    students.forEach((student, index) => {
      if (student.course) courses.add(student.course);
      if (student.bursary) bursaries.add(student.bursary);
      if (student.university) universities.add(student.university);
    });

    // Check courses - using module_name column
    if (courses.size > 0) {
      const existingCourses = await this.dataSource.query(
        'SELECT DISTINCT module_name FROM courses WHERE module_name = ANY($1)',
        [Array.from(courses)]
      );
      const existingCourseNames = existingCourses.map(row => row.module_name);
      const missingCourses = Array.from(courses).filter(course => !existingCourseNames.includes(course));
      
      missingCourses.forEach(course => {
        const rows = students
          .map((student, index) => student.course === course ? index + 1 : -1)
          .filter(row => row !== -1);
        missingReferences.push({ type: 'course', name: course, rows });
      });
    }

    // Check bursaries - using bursary_name column
    if (bursaries.size > 0) {
      const existingBursaries = await this.dataSource.query(
        'SELECT DISTINCT bursary_name FROM bursary_names WHERE bursary_name = ANY($1)',
        [Array.from(bursaries)]
      );
      const existingBursaryNames = existingBursaries.map(row => row.bursary_name);
      const missingBursaries = Array.from(bursaries).filter(bursary => !existingBursaryNames.includes(bursary));
      
      missingBursaries.forEach(bursary => {
        const rows = students
          .map((student, index) => student.bursary === bursary ? index + 1 : -1)
          .filter(row => row !== -1);
        missingReferences.push({ type: 'bursary', name: bursary, rows });
      });
    }

    // Check universities - using tertiary_name column
    if (universities.size > 0) {
      const existingUniversities = await this.dataSource.query(
        'SELECT DISTINCT tertiary_name FROM tertiary_names WHERE tertiary_name = ANY($1)',
        [Array.from(universities)]
      );
      const existingUniversityNames = existingUniversities.map(row => row.tertiary_name);
      const missingUniversities = Array.from(universities).filter(university => !existingUniversityNames.includes(university));
      
      missingUniversities.forEach(university => {
        const rows = students
          .map((student, index) => student.university === university ? index + 1 : -1)
          .filter(row => row !== -1);
        missingReferences.push({ type: 'university', name: university, rows });
      });
    }

    return missingReferences;
  }

  private async bulkCreateStudentsWithTransaction(students: BulkUploadStudentDto[]): Promise<BulkUploadResponseDto> {
    const response: BulkUploadResponseDto = {
      totalProcessed: students.length,
      successful: 0,
      failed: 0,
      errors: [],
      createdStudents: [],
    };

    // Use database transaction for all-or-nothing insert
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        try {
          // Validate required fields
          if (!student.bursary || !student.studentEmail || !student.studentNameAndSurname) {
            response.errors.push({
              row: i + 1,
              email: student.studentEmail || 'N/A',
              error: 'Missing required fields: bursary, studentEmail, or studentNameAndSurname',
            });
            response.failed++;
            continue;
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(student.studentEmail)) {
            response.errors.push({
              row: i + 1,
              email: student.studentEmail,
              error: 'Invalid email format',
            });
            response.failed++;
            continue;
          }

          // Validate year
          if (student.year && (student.year < 1 || student.year > 6)) {
            response.errors.push({
              row: i + 1,
              email: student.studentEmail,
              error: 'Year must be between 1 and 6',
            });
            response.failed++;
            continue;
          }

          // Validate status
          const validStatuses = ['active', 'inactive', 'graduated', 'suspended'];
          if (student.status && !validStatuses.includes(student.status.toLowerCase())) {
            response.errors.push({
              row: i + 1,
              email: student.studentEmail,
              error: `Status must be one of: ${validStatuses.join(', ')}`,
            });
            response.failed++;
            continue;
          }

          // Validate enrollment date
          if (student.enrollmentDate) {
            const enrollmentDate = new Date(student.enrollmentDate);
            if (isNaN(enrollmentDate.getTime())) {
              response.errors.push({
                row: i + 1,
                email: student.studentEmail,
                error: 'Invalid enrollment date format',
              });
              response.failed++;
              continue;
            }
          }

          // Check if student already exists
          const existingStudent = await queryRunner.manager.findOne(BursaryStudent, {
            where: { studentEmail: student.studentEmail },
          });

          if (existingStudent) {
            response.errors.push({
              row: i + 1,
              email: student.studentEmail,
              error: 'Student with this email already exists',
            });
            response.failed++;
            continue;
          }

          // Generate unique ID
          const uniqueId = `BS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Create student
          const bursaryStudent = queryRunner.manager.create(BursaryStudent, {
            uniqueId,
            bursary: student.bursary,
            studentEmail: student.studentEmail,
            studentNameAndSurname: student.studentNameAndSurname,
            year: student.year,
            university: student.university,
            course: student.course,
            studentIdNumber: student.studentIdNumber,
            phoneNumber: student.phoneNumber,
            address: student.address,
            enrollmentDate: student.enrollmentDate ? new Date(student.enrollmentDate) : undefined,
            status: student.status,
            studentDisallowed: false,
            slug: student.studentEmail.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            creator: 'bulk-upload',
          });

          await queryRunner.manager.save(bursaryStudent);
          response.createdStudents.push(student);
          response.successful++;
        } catch (error) {
          response.errors.push({
            row: i + 1,
            email: student.studentEmail || 'N/A',
            error: error.message,
          });
          response.failed++;
        }
      }

      // Commit transaction if all valid students were processed
      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback transaction on any error
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Transaction failed: ${error.message}`);
    } finally {
      await queryRunner.release();
    }

    return response;
  }

  private async parseCsvFile(buffer: Buffer): Promise<BulkUploadStudentDto[]> {
    return new Promise((resolve, reject) => {
      const students: BulkUploadStudentDto[] = [];
      const stream = Readable.from(buffer.toString());
      
      stream
        .pipe(csv())
        .on('data', (row) => {
          const student = this.mapCsvRowToStudent(row);
          if (student) {
            students.push(student);
          }
        })
        .on('end', () => {
          resolve(students);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  private async parseExcelFile(buffer: Buffer): Promise<BulkUploadStudentDto[]> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    return jsonData.map((row: any) => this.mapExcelRowToStudent(row)).filter(Boolean);
  }

  private mapCsvRowToStudent(row: any): BulkUploadStudentDto | null {
    try {
      return {
        bursary: row.bursary || row.Bursary || '',
        studentEmail: row.studentEmail || row['Student Email'] || row.email || '',
        studentNameAndSurname: row.studentNameAndSurname || row['Student Name'] || row.name || '',
        year: row.year ? parseInt(row.year) : undefined,
        university: row.university || row.University || undefined,
        course: row.course || row.Course || undefined,
        studentIdNumber: row.studentIdNumber || row['Student ID'] || row.id || undefined,
        phoneNumber: row.phoneNumber || row['Phone Number'] || row.phone || undefined,
        address: row.address || row.Address || undefined,
        enrollmentDate: row.enrollmentDate || row['Enrollment Date'] || undefined,
        status: row.status || row.Status || undefined,
      };
    } catch (error) {
      return null;
    }
  }

  private mapExcelRowToStudent(row: any): BulkUploadStudentDto | null {
    try {
      return {
        bursary: row.bursary || row.Bursary || '',
        studentEmail: row.studentEmail || row['Student Email'] || row.email || '',
        studentNameAndSurname: row.studentNameAndSurname || row['Student Name'] || row.name || '',
        year: row.year ? parseInt(row.year) : undefined,
        university: row.university || row.University || undefined,
        course: row.course || row.Course || undefined,
        studentIdNumber: row.studentIdNumber || row['Student ID'] || row.id || undefined,
        phoneNumber: row.phoneNumber || row['Phone Number'] || row.phone || undefined,
        address: row.address || row.Address || undefined,
        enrollmentDate: row.enrollmentDate || row['Enrollment Date'] || undefined,
        status: row.status || row.Status || undefined,
      };
    } catch (error) {
      return null;
    }
  }

}
