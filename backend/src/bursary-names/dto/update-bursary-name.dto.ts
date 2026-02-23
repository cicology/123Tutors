import { PartialType } from '@nestjs/swagger';
import { CreateBursaryNameDto } from './create-bursary-name.dto';

export class UpdateBursaryNameDto extends PartialType(CreateBursaryNameDto) {}
