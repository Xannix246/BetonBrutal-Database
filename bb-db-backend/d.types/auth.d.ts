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

export type DiscordTokenRefreshResponce = {
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
};

export type DiscordOAuthData = {
  //also application and scopes
  user: {
    id: string;
    username: string;
    avatar: string;
    accent_color: number;
    global_name: string;
    banner_color: string; //hex
  };
};
