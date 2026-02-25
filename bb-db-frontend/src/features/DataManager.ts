import { config } from "../../config/config"
import { api } from "./Auth"

export const DeleteMap = async (id: string): Promise<void> => {
  await api.delete(`${config.serverUri}/manage/workshop/${id}/delete`);
}

export const deleteReplay = async (id: string): Promise<void> => {
  await api.delete(`${config.serverUri}/manage/replays/${id}`);
}

export const banReplay = async (id: string): Promise<void> => {
  await api.put(`${config.serverUri}/manage/replays/${id}/ban`);
}

export const unbanReplay = async (id: string): Promise<void> => {
  await api.put(`${config.serverUri}/manage/replays/${id}/unban`);
}