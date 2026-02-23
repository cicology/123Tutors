import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Invoice } from '../../invoices/invoices.entity';

// pdfkit is commonjs; require avoids default-import interop issues.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

export interface InvoiceDeliveryResult {
  sent: boolean;
  recipient: string;
  messageId?: string;
  transport: 'smtp' | 'log-only';
}

@Injectable()
export class InvoiceDeliveryService {
  private readonly logger = new Logger(InvoiceDeliveryService.name);

  private formatCurrency(value: number | string): string {
    const numberValue = Number(value || 0);
    return `R ${numberValue.toFixed(2)}`;
  }

  async buildInvoicePdfBuffer(invoice: Invoice): Promise<Buffer> {
    return await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(24).text('123Tutors Invoice', { align: 'left' });
      doc.moveDown(1);
      doc.fontSize(11).text(`Invoice Number: ${invoice.invoiceNumber}`);
      doc.text(`Invoice ID: ${invoice.uniqueId}`);
      doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`);
      doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`);
      doc.moveDown(1);

      doc.fontSize(12).text('Bill To');
      doc.fontSize(11).text(`Student: ${invoice.studentName}`);
      doc.text(`Email: ${invoice.studentEmail}`);
      if (invoice.bursaryName) {
        doc.text(`Bursary: ${invoice.bursaryName}`);
      }
      doc.moveDown(1);

      doc.fontSize(12).text('Line Item');
      doc.fontSize(11).text(invoice.courseName || 'Tutoring Services');
      doc.text(`Amount Due: ${this.formatCurrency(invoice.amount)}`);
      doc.text(`Status: ${invoice.status}`);
      doc.moveDown(1);

      if (invoice.notes) {
        doc.fontSize(11).text(`Notes: ${invoice.notes}`);
        doc.moveDown(1);
      }

      doc
        .fontSize(10)
        .fillColor('#666666')
        .text(
          'This invoice was generated automatically by the 123Tutors platform.',
          { align: 'left' },
        );

      doc.end();
    });
  }

  async sendInvoice(
    invoice: Invoice,
    recipientOverride?: string,
  ): Promise<InvoiceDeliveryResult> {
    const recipient = recipientOverride || invoice.studentEmail;
    const pdfBuffer = await this.buildInvoicePdfBuffer(invoice);

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || 'noreply@123tutors.co.za';

    if (!smtpHost || !smtpUser || !smtpPass) {
      this.logger.warn(
        `SMTP not configured. Invoice ${invoice.invoiceNumber} generated but not emailed.`,
      );
      return {
        sent: false,
        recipient,
        transport: 'log-only',
      };
    }

    const transport = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailResult = await transport.sendMail({
      from: smtpFrom,
      to: recipient,
      subject: `Invoice ${invoice.invoiceNumber} - 123Tutors`,
      text: `Hi,\n\nPlease find attached invoice ${invoice.invoiceNumber} for ${this.formatCurrency(
        invoice.amount,
      )}.\n\nRegards,\n123Tutors`,
      attachments: [
        {
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return {
      sent: true,
      recipient,
      transport: 'smtp',
      messageId: mailResult.messageId,
    };
  }
}
