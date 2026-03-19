import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { AuthRequest } from 'd.types/auth';

@Injectable()
export class CheckGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles =
      this.reflector.getAllAndOverride<string[]>('roles', [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];
    const req = context.switchToHttp().getRequest<AuthRequest>();
    const { id } = req.params;

    if (!req.user) {
      throw new UnauthorizedException();
    }

    if (!id) {
      throw new BadRequestException('Id is required');
    }

    const collection = await this.prisma.collection.findUnique({
      where: { id: id },
      select: { authorId: true },
    });

    if (!collection) {
      throw new NotFoundException();
    }

    if (
      req.user.id === collection?.authorId ||
      roles.includes(String(req.user.role))
    ) {
      return true;
    } else {
      return false;
    }
  }
}
