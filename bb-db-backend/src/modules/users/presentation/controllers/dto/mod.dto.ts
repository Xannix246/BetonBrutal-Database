import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMapDataDto {
  title: string;
  previewUrl: string;
  creator: string;
  creatorId?: string;
  description?: string;
  previews?: string[];
  createDate?: Date;
}

export class UpdateMapDataDto {
  title?: string;
  previewUrl?: string;
  creator?: string;
  description?: string;
  previews?: string[];
}

export class UpsertMapDto {
  @ApiProperty({
    name: 'Update or create map',
    description:
      'API endpoint for creating or updating workshop item. Only for admins',
    example: {
      type: 'WorkshopItemCreate',
      data: {
        title: 'Just Another Collab',
        previewUrl:
          'https://images.steamusercontent.com/ugc/17558057311979993/B8A42AC76E88C9DD35147535759B2A2A1E8560E5/',
        creator: 'Xannix',
        creatorId: '76561198383611657',
        description: 'Some description',
        previews: [
          'https://images.steamusercontent.com/ugc/47957354645490933/B3ECAD9EEF347D38AAD8577D154141E370687E19/',
          'https://images.steamusercontent.com/ugc/47957354645490907/8DCD34CEA4B6667C99B21DD1E75FCD1F8BECED48/',
          'https://images.steamusercontent.com/ugc/47957354645490952/F5C6BBB6413FAB73CEA03ED9E33E5CB6D67D53A2/',
        ],
        createDate: new Date('2025-03-31T10:27:23.000+00:00'),
      },
    } satisfies UpsertMapDto,
  })
  @ApiProperty({
    enum: ['WorkshopItemCreate', 'WorkshopItemUpdate'],
  })
  type: 'WorkshopItemCreate' | 'WorkshopItemUpdate';

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(CreateMapDataDto) },
      { $ref: getSchemaPath(UpdateMapDataDto) },
    ],
  })
  @Type(() => Object, {
    discriminator: {
      property: 'type',
      subTypes: [
        { name: 'WorkshopItemCreate', value: CreateMapDataDto },
        { name: 'WorkshopItemUpdate', value: UpdateMapDataDto },
      ],
    },
  })
  data: CreateMapDataDto | UpdateMapDataDto;
}
