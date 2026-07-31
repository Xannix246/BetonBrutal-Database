import { api, authClient } from "@/features";
import { addToast } from "@/store";
import { v4 } from "uuid";
import { navigate } from "vike/client/router";

const getApiKey = async () => {
  const response = await authClient.apiKey.create({
    name: "BBDB-Core key",
  });

  return response.data?.key;
};

export const sendKey = async (callbackUrl: string) => {
  const key = await getApiKey();

  if (!key) {
    addToast({
      id: v4(),
      time: 5000,
      type: "error",
      title: "Failed to get Api key",
    });
    return false;
  }

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = `${callbackUrl}?api_key=${key}`;

  document.body.appendChild(iframe);

  return true;
};
