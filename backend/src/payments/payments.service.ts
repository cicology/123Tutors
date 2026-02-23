import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { InvoicesService } from '../invoices/invoices.service';
import { TutorRequestsService } from '../tutor-requests/tutor-requests.service';
import { VerifyPaystackPaymentDto } from './dto/verify-paystack-payment.dto';

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    status: string;
    amount: number;
    currency: string;
    reference: string;
    paid_at?: string;
    metadata?: {
      invoiceUniqueId?: string;
      requestUniqueId?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

interface PaystackWebhookPayload {
  event?: string;
  data?: {
    reference?: string;
    metadata?: {
      invoiceUniqueId?: string;
      requestUniqueId?: string;
      requestId?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

type VerifyPaystackPaymentResult = {
  success: boolean;
  verified: boolean;
  message: string;
  reference: string;
  amountPaid: number;
  currency: string;
  invoiceUniqueId?: string;
  requestUniqueId?: string;
  paidAt?: string;
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly invoicesService: InvoicesService,
    private readonly tutorRequestsService: TutorRequestsService,
  ) {}

  private getPaystackSecret(): string {
    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (!secret) {
      throw new InternalServerErrorException('PAYSTACK_SECRET_KEY is not configured');
    }
    return secret;
  }

  private buildExpectedWebhookSignature(rawBody: string, secret: string): string {
    return createHmac('sha512', secret).update(rawBody).digest('hex');
  }

  async verifyPaystackPayment(dto: VerifyPaystackPaymentDto): Promise<VerifyPaystackPaymentResult> {
    const secret = this.getPaystackSecret();
    const verifyUrl = `https://api.paystack.co/transaction/verify/${encodeURIComponent(
      dto.reference,
    )}`;

    const response = await fetch(verifyUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
    });

    const payload = (await response.json()) as PaystackVerifyResponse;
    if (!response.ok || !payload?.status || !payload?.data) {
      throw new BadRequestException(payload?.message || 'Unable to verify Paystack transaction');
    }

    if (payload.data.status !== 'success') {
      return {
        success: true,
        verified: false,
        message: `Transaction status is ${payload.data.status}`,
        reference: payload.data.reference || dto.reference,
        amountPaid: Number(payload.data.amount || 0) / 100,
        currency: payload.data.currency || 'ZAR',
      };
    }

    const metadata = payload.data.metadata || {};
    const invoiceUniqueId = dto.invoiceUniqueId || metadata.invoiceUniqueId;
    const metadataRequestUniqueId = dto.requestUniqueId || metadata.requestUniqueId;
    const amountMinor = Number(payload.data.amount || 0);
    const amountMajor = amountMinor / 100;

    let resolvedRequestUniqueId = metadataRequestUniqueId;

    if (invoiceUniqueId) {
      const invoice = await this.invoicesService.findOne(invoiceUniqueId);
      const expectedAmountMinor = Math.round(Number(invoice.amount || 0) * 100);
      if (amountMinor < expectedAmountMinor) {
        throw new BadRequestException(
          `Paystack amount (${amountMajor.toFixed(2)}) is less than invoice amount (${Number(
            invoice.amount || 0,
          ).toFixed(2)})`,
        );
      }

      if (invoice.status !== 'paid') {
        await this.invoicesService.markAsPaid(invoice.uniqueId, 'paystack');
      }

      resolvedRequestUniqueId = resolvedRequestUniqueId || invoice.requestUniqueId;
    }

    if (resolvedRequestUniqueId) {
      try {
        await this.tutorRequestsService.update(resolvedRequestUniqueId, {
          paid: true,
          paidDate: new Date().toISOString(),
        });
      } catch (error) {
        this.logger.warn(
          `Payment verified for ${dto.reference}, but tutor request update failed (${resolvedRequestUniqueId}): ${error?.message}`,
        );
      }
    }

    return {
      success: true,
      verified: true,
      message: 'Paystack payment verified successfully',
      reference: payload.data.reference || dto.reference,
      amountPaid: amountMajor,
      currency: payload.data.currency || 'ZAR',
      invoiceUniqueId,
      requestUniqueId: resolvedRequestUniqueId,
      paidAt: payload.data.paid_at,
    };
  }

  async handlePaystackWebhook(
    payload: PaystackWebhookPayload,
    signature: string | undefined,
    rawBody: string | undefined,
  ): Promise<{
    success: boolean;
    received: boolean;
    processed: boolean;
    event: string;
    message: string;
    reference?: string;
  }> {
    if (!signature) {
      throw new BadRequestException('Missing x-paystack-signature header');
    }
    if (!rawBody) {
      throw new BadRequestException('Missing raw request body for signature verification');
    }

    const secret = this.getPaystackSecret();
    const expectedSignature = this.buildExpectedWebhookSignature(rawBody, secret);
    if (signature !== expectedSignature) {
      throw new BadRequestException('Invalid Paystack webhook signature');
    }

    const event = String(payload?.event || 'unknown');
    if (event !== 'charge.success') {
      return {
        success: true,
        received: true,
        processed: false,
        event,
        message: `Webhook event ignored: ${event}`,
      };
    }

    const reference = payload?.data?.reference;
    if (!reference) {
      throw new BadRequestException('Paystack webhook payload is missing data.reference');
    }

    const metadata = payload?.data?.metadata || {};
    const verifyResult = await this.verifyPaystackPayment({
      reference,
      invoiceUniqueId:
        typeof metadata.invoiceUniqueId === 'string' ? metadata.invoiceUniqueId : undefined,
      requestUniqueId:
        typeof metadata.requestUniqueId === 'string'
          ? metadata.requestUniqueId
          : typeof metadata.requestId === 'string'
            ? metadata.requestId
            : undefined,
    });

    this.logger.log(
      `Paystack webhook processed for ${verifyResult.reference} (verified=${verifyResult.verified})`,
    );

    return {
      success: true,
      received: true,
      processed: verifyResult.verified,
      event,
      message: verifyResult.message,
      reference: verifyResult.reference,
    };
  }
}
