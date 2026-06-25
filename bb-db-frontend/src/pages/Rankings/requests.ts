import { api } from "@features";
import { config } from "@config";

export const getBrutalReplays = async (): Promise<Replay[]>  => {
  return (await api.get(`${config.serverUri}/workshop/TimeMS/replays`)).data;
}

export const getBathReplays = async (): Promise<Replay[]>  => {
  return (await api.get(`${config.serverUri}/workshop/TimeDLC1/replays`)).data;
}

export const getBdayReplays = async (): Promise<Replay[]>  => {
  return (await api.get(`${config.serverUri}/workshop/TimeBirthday/replays`)).data;
}
