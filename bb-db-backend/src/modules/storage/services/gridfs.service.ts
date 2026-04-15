import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { MongoClient, GridFSBucket, ObjectId, Collection } from 'mongodb';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { env } from 'node:process';

@Injectable()
export class GridFSService implements OnModuleInit {
  private client!: MongoClient;
  private bucket!: GridFSBucket;
  private collection!: Collection;

  constructor(private readonly prisma: PrismaService) {}

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

  async uploadCollectionFile(
    userId: string,
    collectionId: string,
    buffer: Buffer,
  ) {
    if (!userId || !buffer || !collectionId) {
      throw new BadRequestException();
    }

    const existingFile = await this.collection.findOne({
      'metadata.userId': userId,
      'metadata.collectionId': collectionId,
    });

    if (existingFile) {
      await this.bucket.delete(existingFile._id);
    }

    const uploadStream = this.bucket.openUploadStreamWithId(
      existingFile?._id || new ObjectId(),
      collectionId,
      {
        metadata: {
          userId,
          collectionId,
        },
      },
    );

    const id = await new Promise<ObjectId>((resolve, reject) => {
      uploadStream.end(buffer);
      uploadStream.on('finish', () => resolve(uploadStream.id));
      uploadStream.on('error', reject);
    });
    const url = `${env.BETTER_AUTH_URL}/api/files/${id.toString()}`;

    await this.prisma.collection.update({
      where: { id: collectionId },
      data: {
        previewUrl: url,
      },
    });

    await this.prisma.workshopItem.update({
      where: { linkedCollection: collectionId },
      data: {
        previewUrl: url,
      },
    });

    return url;
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
