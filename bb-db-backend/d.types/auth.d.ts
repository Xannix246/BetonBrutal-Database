import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    name: string;
    email: string;
    emailVerified: boolean;
    image: string;
    createdAt: Date;
    updatedAt: Date;
    role: $Enums.Role;
    banned: boolean;
    banReason: null | string;
    banExpires: null | Date;
    id: string;
    steamId: null | string;
  };
}
