import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';

@Injectable()
export class GridFSService implements OnModuleInit {
  private client: MongoClient;
  private bucket: GridFSBucket;

  async onModuleInit() {
    this.client = await MongoClient.connect(process.env.DATABASE_URL!);
    const db = this.client.db();
    this.bucket = new GridFSBucket(db, { bucketName: 'uploads' });
  }

  async upload(filename: string, buffer: Buffer, contentType: string) {
    return new Promise<ObjectId>((resolve, reject) => {
      const uploadStream = this.bucket.openUploadStream(filename);
      uploadStream.end(buffer);
      uploadStream.on('finish', () => resolve(uploadStream.id));
      uploadStream.on('error', reject);
    });
  }

  getFileStream(id: string) {
    if (!ObjectId.isValid(id)) throw new NotFoundException();
    return this.bucket.openDownloadStream(new ObjectId(id));
  }

  async delete(id: string) {
    if (!ObjectId.isValid(id)) throw new NotFoundException();
    return this.bucket.delete(new ObjectId(id));
  }
}
