import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private storageEnabled = false;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('SUPABASE_BUCKET_NAME') || '123_bursary_images';
    
    // Debug: Log Supabase configuration
    const endpoint = this.configService.get<string>('SUPABASE_S3_ENDPOINT');
    const region = this.configService.get<string>('SUPABASE_BUCKET_REGION');
    const accessKeyId = this.configService.get<string>('SUPABASE_S3_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('SUPABASE_S3_SECRET_ACCESS_KEY');
    
    console.log('🔍 Supabase Storage Configuration:');
    console.log('  Endpoint:', endpoint || 'NOT SET');
    console.log('  Region:', region || 'NOT SET');
    console.log('  Bucket:', this.bucketName);
    console.log('  Access Key:', accessKeyId ? '***' + accessKeyId.slice(-4) : 'NOT SET');
    console.log('  Secret Key:', secretAccessKey ? '***' + secretAccessKey.slice(-4) : 'NOT SET');
    
    if (!endpoint || !accessKeyId || !secretAccessKey) {
      console.warn('⚠ Supabase Storage disabled. Missing SUPABASE_S3_ENDPOINT or credentials.');
      return;
    }
    
    this.s3Client = new S3Client({
      endpoint: endpoint,
      region: region || 'us-east-1',
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
      forcePathStyle: true, // Required for Supabase Storage
    });

    this.storageEnabled = true;
    console.log('✅ Supabase Storage S3 Client initialized successfully');
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'profile-images'): Promise<string> {
    if (!this.storageEnabled) {
      throw new Error('Supabase Storage is disabled. Configure SUPABASE_S3_ENDPOINT and credentials first.');
    }

    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${randomUUID()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });

    try {
      await this.s3Client.send(command);
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
      return `${supabaseUrl}/storage/v1/object/public/${this.bucketName}/${fileName}`;
    } catch (error) {
      console.error('Error uploading file to Supabase Storage:', error);
      throw new Error('Failed to upload file');
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (!this.storageEnabled) {
      throw new Error('Supabase Storage is disabled. Configure SUPABASE_S3_ENDPOINT and credentials first.');
    }

    try {
      // Extract the file key from the URL
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2];
      const key = `${folder}/${fileName}`;

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from Supabase Storage:', error);
      throw new Error('Failed to delete file');
    }
  }
}

