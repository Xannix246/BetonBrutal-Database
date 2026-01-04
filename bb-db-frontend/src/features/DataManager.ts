import { config } from "../../config/config"
import { api } from "./Auth"

export const DeleteMap = async (id: string): Promise<void> => {
  await api.delete(`${config.serverUri}/workshop/${id}/delete`);
}

export const deleteReplay = async (id: string): Promise<void> => {
  await api.delete(`${config.serverUri}/workshop/replays/${id}`);
}

export const banReplay = async (id: string): Promise<void> => {
  await api.put(`${config.serverUri}/workshop/replays/${id}/ban`);
}

export const unbanReplay = async (id: string): Promise<void> => {
  await api.put(`${config.serverUri}/workshop/replays/${id}/unban`);
}