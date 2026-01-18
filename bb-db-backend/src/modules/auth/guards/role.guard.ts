import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    const req = context.switchToHttp().getRequest<AuthRequest>();

    if (!roles) {
      return true;
    }

    if (!req.user || !roles.includes(String(req.user.role))) {
      return false;
    } else {
      return true;
    }
  }
}
