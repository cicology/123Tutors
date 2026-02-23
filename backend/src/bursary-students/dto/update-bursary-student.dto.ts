import { PartialType } from '@nestjs/swagger';
import { CreateBursaryStudentDto } from './create-bursary-student.dto';

export class UpdateBursaryStudentDto extends PartialType(CreateBursaryStudentDto) {}

