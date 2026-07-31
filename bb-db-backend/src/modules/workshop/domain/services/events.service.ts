import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { UserRoleSession } from 'src/modules/auth/auth.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async getEventData() {
    const data = await this.prisma.eventData.findFirst();

    if (!data || !data.isVisible) {
      return null;
    }

    return data;
  }

  async setEventData(setData: {
    title?: string;
    description?: string;
    start?: string;
    end?: string;
    imageUrl?: string;
    isVisible?: boolean;
    themeWords?: string[];
    items?: {
      id: string;
      title: string;
      creator: string;
      originality: number;
      aesthetic: number;
      fun: number;
      theme: number;
      totalScore: number;
      userVotes: string[];
    }[];
  }) {
    const data = await this.prisma.eventData.findFirst();
    let updatedItems = data?.items ?? [];

    if (setData.items && setData.items.length > 0) {
      const itemsMap = new Map(updatedItems.map((item) => [item.id, item]));

      for (const newItem of setData.items) {
        itemsMap.set(newItem.id, newItem);
      }

      updatedItems = Array.from(itemsMap.values());
    }

    return await this.prisma.eventData.upsert({
      where: { id: data?.id ?? new ObjectId().toString() },
      create: {
        title: setData.title ?? '',
        description: setData.description ?? '',
        start: setData.start ? new Date(Number(setData.start)) : new Date(),
        end: setData.end ? new Date(Number(setData.end)) : new Date(),
        imageUrl: setData.imageUrl ?? '',
        isVisible: setData.isVisible ?? true,
        themeWords: setData.themeWords ?? [],
        items: setData.items ?? [],
      },
      update: {
        ...(setData.title !== undefined && { title: setData.title }),
        ...(setData.description !== undefined && {
          description: setData.description,
        }),
        ...(setData.start !== undefined && {
          start: new Date(Number(setData.start)),
        }),
        ...(setData.end !== undefined && {
          end: new Date(Number(setData.end)),
        }),
        ...(setData.imageUrl !== undefined && { imageUrl: setData.imageUrl }),
        ...(setData.isVisible !== undefined && {
          isVisible: setData.isVisible,
        }),
        ...(setData.themeWords !== undefined && {
          themeWords: setData.themeWords,
        }),
        items: updatedItems,
      },
    });
  }

  async setVote(session: UserRoleSession, mapId: string) {
    const userId = session.user.id;
    const eventData = await this.prisma.eventData.findFirst();

    if (!eventData) {
      return null;
    }

    const updatedItems = eventData.items.map((item) => {
      const hasVoted = item.userVotes.includes(userId);

      if (item.id === mapId) {
        if (hasVoted) {
          return {
            ...item,
            userVotes: item.userVotes.filter((id) => id !== userId),
          };
        } else {
          return { ...item, userVotes: [...item.userVotes, userId] };
        }
      } else {
        if (hasVoted) {
          return {
            ...item,
            userVotes: item.userVotes.filter((id) => id !== userId),
          };
        }
        return item;
      }
    });

    return await this.prisma.eventData.update({
      where: { id: eventData.id },
      data: {
        items: updatedItems,
      },
    });
  }
}
