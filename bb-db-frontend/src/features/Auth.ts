import { createAuthClient } from "better-auth/client";
import { config } from "../../config/config";

export const authClient = createAuthClient({
  baseURL: config.serverUri
});

export const signIn = async (callbackURL: string = "/") => {
  const data = await authClient.signIn.social({
    provider: "discord",
    callbackURL: config.domain + callbackURL
  });

  return data;
}

export const logOut = async () => {
  await authClient.signOut();
}
