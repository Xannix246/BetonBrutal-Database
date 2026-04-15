import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { AuthRequest } from 'd.types/auth';

@Injectable()
export class QuantityGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthRequest>();

    if (!req.user) {
      throw new UnauthorizedException();
    }

    const collections = await this.prisma.collection.findMany({
      where: { authorId: req.user.id },
    });

    if (collections.length < 50) {
      return true;
    } else {
      return false;
    }
  }
}
