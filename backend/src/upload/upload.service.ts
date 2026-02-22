import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private s3: S3Client | null = null;
  private bucket: string;
  private cdnUrl: string;

  constructor(private config: ConfigService) {
    const region = this.config.get<string>('AWS_REGION');
    const accessKey = this.config.get<string>('AWS_ACCESS_KEY_ID');
    const secretKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY');
    this.bucket = this.config.get<string>('AWS_S3_BUCKET') || 'uploads';
    this.cdnUrl = this.config.get<string>('AWS_S3_CDN_URL') || '';

    if (region && accessKey && secretKey) {
      this.s3 = new S3Client({
        region,
        credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    if (!this.s3) {
      // Fallback: return placeholder for dev without S3
      return `https://via.placeholder.com/400?text=Upload+disabled`;
    }

    const ext = file.originalname.split('.').pop() || 'jpg';
    const key = `${folder}/${uuidv4()}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return this.cdnUrl ? `${this.cdnUrl}/${key}` : `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }
}
