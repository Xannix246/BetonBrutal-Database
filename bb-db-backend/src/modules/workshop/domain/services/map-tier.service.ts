import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Labels, TierData, TierEntry } from '@prisma/client';
import { ObjectId } from 'mongodb';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { assignDefined } from 'src/shared/assignDefined';

@Injectable()
export class MapTierService {
  constructor(private readonly prisma: PrismaService) {}

  private validateTier(tier: number): void {
    if (tier < -1 || tier > 10) {
      throw new BadRequestException('Tier number too small or too large');
    }
  }

  private async upsertTierData(data: {
    mapId: string;
    modTier?: number;
    avgTier?: number;
    labels?: string[];
  }): Promise<TierData> {
    const updateData = assignDefined({
      modTier: data.modTier,
      avgTier: data.avgTier,
    });

    const map = await this.prisma.workshopItem.findUniqueOrThrow({
      where: { steamId: data.mapId },
    });

    if (!map) {
      throw new NotFoundException('Map not found');
    }

    const tierData = await this.prisma.tierData.upsert({
      where: { mapId: data.mapId },
      update: updateData,
      create: {
        modTier: data.modTier ?? -1,
        avgTier: data.avgTier ?? data.modTier ?? -1,
        labels: [],
        map: { connect: { id: map.id } },
      },
    });

    return tierData;
  }

  private async recalcAvgTier(tierId: string): Promise<void> {
    const entries = await this.prisma.tierEntry.findMany({
      where: { AND: { tierId, status: 'accepted' } },
      select: {
        tier: true,
      },
    });

    const tierData = await this.prisma.tierData.findUnique({
      where: { id: tierId },
    });

    if (!tierData) {
      throw new NotFoundException('Tier data not found');
    }

    const tiersArray = entries.map((entry) => entry.tier);
    let sum = 0;

    for (const tier of tiersArray) {
      sum += tier;
    }

    const avgTier =
      tiersArray.length > 0 && tierData.modTier !== -1
        ? (sum + tierData.modTier) / (tiersArray.length + 1)
        : tierData?.modTier;

    await this.prisma.tierData.update({
      where: { id: tierId },
      data: {
        avgTier,
      },
    });
  }

  async createTierEntry(
    userId: string,
    mapId: string,
    tier: number,
  ): Promise<TierEntry> {
    this.validateTier(tier);

    const data = await this.prisma.tierData.findUnique({
      where: { mapId },
    });

    if (!data) {
      throw new NotFoundException('Tier data not found');
    }

    const existingEntry = await this.prisma.tierEntry.findUnique({
      where: { userId_tierId: { userId, tierId: data.id } },
    });

    if (existingEntry) {
      throw new ConflictException(
        'Entry already exists. Please consider using update method instead',
      );
    }

    return this.prisma.tierEntry.create({
      data: {
        userId,
        tier,
        tierId: data.id,
        mapId,
        status: 'pending',
      },
    });
  }

  async updateTierEntry(entryData: {
    entryId: string;
    tier?: number;
    type?: 'accepted' | 'denied' | 'pending';
  }): Promise<TierEntry> {
    this.validateTier(entryData.tier as number);

    const data = assignDefined({
      tier: entryData.tier,
      status: entryData.type,
    });

    const updatedEntry = await this.prisma.tierEntry.update({
      where: { id: entryData.entryId },
      data,
    });

    if (entryData.type === 'accepted') {
      void this.recalcAvgTier(updatedEntry.tierId);
    }

    return updatedEntry;
  }

  async updateUserEntry(
    userId: string,
    mapId: string,
    tier: number,
  ): Promise<TierEntry> {
    const tierId = (await this.getTierData(mapId))?.id;

    if (!tierId) {
      throw new NotFoundException('Tier data not found');
    }

    const entry = await this.prisma.tierEntry.findUnique({
      where: { userId_tierId: { userId, tierId } },
    });

    if (!entry) {
      return this.createTierEntry(userId, mapId, tier);
    }

    return this.updateTierEntry({
      entryId: entry?.id,
      tier,
      type: 'pending',
    });
  }

  async getTierEntries(data: {
    userId?: string;
    tierId?: string;
    mapId?: string;
    type?: 'accepted' | 'denied' | 'pending';
  }): Promise<TierEntry[]> {
    const where = assignDefined({
      userId: data.userId,
      tierId: data.tierId,
      mapId: data.mapId,
      status: data.type,
    });

    return await this.prisma.tierEntry.findMany({
      where: { AND: where },
    });
  } // by user id, tierData id or map id

  async getTierData(id: string): Promise<TierData | null> {
    const isObjectId = ObjectId.isValid(id);
    const where = assignDefined({
      id: isObjectId ? id : undefined,
      mapId: !isObjectId ? id : undefined,
    });

    return this.prisma.tierData.findUnique({
      where,
    });
  } // tierData id or map id

  async setTier(
    mapId: string,
    tier: number,
    labels?: Labels[],
  ): Promise<TierData> {
    this.validateTier(tier);

    const tierData = await this.upsertTierData({
      mapId,
      modTier: tier,
      labels,
    });

    void this.recalcAvgTier(tierData.id);

    return tierData;
  }
}
