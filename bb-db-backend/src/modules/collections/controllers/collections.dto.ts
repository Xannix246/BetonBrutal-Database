import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';

export class CollectionDto {
  @ApiProperty({
    description: 'Collection object for creating or updating map collections',
    example: {
      id: '68f2c28e4042a49a1cedba45',
      title: 'Some awesome title',
      description:
        'And some awesome description. MapsId can contain string or string[] btw',
      mapsId: ['3625863922', '3625864017', '3626221178'],
      showOnMain: false,
      descColor: 'black',
    },
  })
  id?: string;
  title?: string;
  description?: string;
  mapsId?: string[];
  showOnMain?: boolean;
  descColor?: $Enums.Color;
  //
  secret: string;
}
