import { ApiProperty } from '@nestjs/swagger';

export class PostArticleDto {
  @ApiProperty({
    description: 'Article title',
    example: 'Some arcticle title',
  })
  title: string;

  @ApiProperty({
    description: 'Article description',
    example: 'Some additional arcticle description for user',
  })
  description?: string;

  @ApiProperty({
    description: 'Article description',
    example: 'Main article data with markdown support',
  })
  content: string;

  @ApiProperty({
    description: 'Article tags',
    example: ['article', '2025'],
  })
  tags: string[];

  @ApiProperty({
    description: 'Article preview url',
  })
  preview?: string;

  @ApiProperty({
    description: 'Article attachments name:urls, used in data',
  })
  attachments: Attachment[];
}
