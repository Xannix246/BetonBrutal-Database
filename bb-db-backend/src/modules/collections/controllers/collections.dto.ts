import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';

export class CollectionDto {
  @ApiProperty({
    description: 'Collection object for creating or updating map collections',
    example: {
      title: 'Some awesome title',
      description:
        'And some awesome description. MapsId can contain string or string[] btw',
      mapsId: ['3625863922', '3625864017', '3626221178'],
      showOnMain: false,
      descColor: 'black',
    },
  })
  title?: string;
  description?: string;
  mapsId?: string[];
  showOnMain?: boolean;
  descColor?: $Enums.Color;
  isPublic?: boolean;
}
