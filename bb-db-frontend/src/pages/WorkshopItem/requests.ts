import axios from "axios";
import { config } from "../../../config/config";

export const getMap = async (
  id: string
): Promise<WorkshopItem>  => {
  return (await axios.get(`${config.serverUri}/workshop/${id}`)).data;
}