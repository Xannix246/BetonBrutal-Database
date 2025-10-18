import { ApiProperty } from '@nestjs/swagger';

export class PostCommentDto {
  @ApiProperty({
    description: 'Message data',
    example: 'Some message to post',
  })
  message: string;

  @ApiProperty({
    description: 'Map id',
    example: '3455543120',
  })
  mapId: string;
}
