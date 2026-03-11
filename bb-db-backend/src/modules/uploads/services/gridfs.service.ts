import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { MongoClient, GridFSBucket, ObjectId, Collection } from 'mongodb';

@Injectable()
export class GridFSService implements OnModuleInit {
  private client: MongoClient;
  private bucket: GridFSBucket;
  private collection: Collection;

  async onModuleInit() {
    this.client = await MongoClient.connect(process.env.DATABASE_URL!);
    const db = this.client.db();
    this.collection = db.collection('uploads.files');
    this.bucket = new GridFSBucket(db, { bucketName: 'uploads' });
  }

  async upload(filename: string, buffer: Buffer) {
    return new Promise<ObjectId>((resolve, reject) => {
      const uploadStream = this.bucket.openUploadStream(filename);
      uploadStream.end(buffer);
      uploadStream.on('finish', () => resolve(uploadStream.id));
      uploadStream.on('error', reject);
    });
  }

  async uploadUserFile(userId: string, buffer: Buffer, type: 'pfp' | 'bg') {
    if (!userId || !type || !buffer || !['pfp', 'bg'].includes(type)) {
      throw new BadRequestException();
    }

    const existingFile = await this.collection.findOne({
      'metadata.userId': userId,
      'metadata.type': type,
    });

    if (existingFile) {
      await this.bucket.delete(existingFile._id);
    }

    const uploadStream = this.bucket.openUploadStreamWithId(
      existingFile?._id || new ObjectId(),
      `${userId}_${type}`,
      {
        metadata: {
          userId,
          type,
        },
      },
    );

    return new Promise<ObjectId>((resolve, reject) => {
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
