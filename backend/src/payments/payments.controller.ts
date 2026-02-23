import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VerifyPaystackPaymentDto } from './dto/verify-paystack-payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('paystack/verify')
  @ApiOperation({ summary: 'Verify a Paystack transaction and reconcile invoice/request status' })
  @ApiResponse({ status: 200, description: 'Payment verification processed successfully' })
  verifyPaystackPayment(@Body() dto: VerifyPaystackPaymentDto) {
    return this.paymentsService.verifyPaystackPayment(dto);
  }
}

