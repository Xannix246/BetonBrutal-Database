import { createAuthClient } from "better-auth/client";
import { config } from "../../config/config";
import { adminClient } from "better-auth/client/plugins"
import axios from "axios";

export const authClient = createAuthClient({
  baseURL: config.baseAuthUrl,
  basePath: 'api/auth',
  plugins: [
    adminClient()
  ],
});

export const signIn = async (callbackURL: string = "/") => {
  const data = await authClient.signIn.social({
    provider: "discord",
    callbackURL: config.domain + callbackURL,
  });

  return data;
}

export const logOut = async () => {
  await authClient.signOut();
}

export const api = axios.create({
    baseURL: `${config.serverUri}`,
    withCredentials: true
})
