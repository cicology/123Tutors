import { IsNumber, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class RequestPaymentDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

