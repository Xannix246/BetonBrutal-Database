import { ApiProperty } from '@nestjs/swagger';

export class GetQueryListDto {
  @ApiProperty({
    description: "Id's array to return their data",
    example: ['3580482732', '3568154128', '3506691477'],
  })
  ids: string[];
}

export class GetQueryReplaysDto {
  @ApiProperty({
    description: "Id's array to return their data",
    example: [
      '68f2c28e4042a49a1cedba45',
      '68f2c28e4042a49a1cedba47',
      '68f2c28e4042a49a1cedba48',
    ],
  })
  ids: string[];

  @ApiProperty({
    description: 'Need to return map names?',
    required: false,
    example: true,
  })
  requestMapNames?: boolean;
}
