import axios from "axios";

export const getMap = async (
  id: string
): Promise<WorkshopItem>  => {
  return (await axios.get(`http://26.220.176.177:3000/workshop/${id}`)).data;
}