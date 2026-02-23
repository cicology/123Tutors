import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyPaystackPaymentDto {
  @ApiProperty({ description: 'Paystack transaction reference', minLength: 6, maxLength: 120 })
  @IsString()
  @MinLength(6)
  @MaxLength(120)
  reference: string;

  @ApiPropertyOptional({ description: 'Invoice unique ID linked to this payment', maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  invoiceUniqueId?: string;

  @ApiPropertyOptional({ description: 'Tutor request unique ID linked to this payment', maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  requestUniqueId?: string;
}

