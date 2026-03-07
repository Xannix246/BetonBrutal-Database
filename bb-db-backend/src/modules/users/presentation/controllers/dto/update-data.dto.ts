import { ApiProperty } from '@nestjs/swagger';

class LinkDto {
  showName: string;
  url: string;
}

export class UpdatePublicDataDto {
  @ApiProperty({
    name: 'Create or update public data',
    example: {
      id: '',
      profilePicUrl: '',
      backgroundUrl: '',
      about: '',
      links: [
        {
          showName: 'steam',
          url: '',
        },
      ],
    } satisfies UpdatePublicDataDto,
  })
  id: string;
  profilePicUrl?: string;
  backgroundUrl?: string;
  about?: string;
  links?: LinkDto[];
}
