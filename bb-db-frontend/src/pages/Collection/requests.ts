import { api } from "@features";

export const getCollection = async (id: string): Promise<Collection> => {
  return (await api.get(`collections/${id}`)).data;
};

export const getItemData = async (ids: string[]): Promise<WorkshopItemHeader[]> => {
  return (await api.post(`/workshop/get-query-list`, { ids })).data;
};

export const getItem = async (id: string): Promise<WorkshopItem> => {
  return (await api.get(`/workshop/${id}`)).data;
};

export const getStats = async (
  collectionId: string,
): Promise<CollectionStats> => {
  return (await api.get(`collections/${collectionId}/stats`)).data;
};

// export const getComments = async () => {};

export const uploadPreview = async (
  image: File,
  id: string,
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", image);

  return (
    await api.post(`collections/${id}/upload-preview`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  ).data;
};

export const postCollection = async (
  data: {
    title: string;
    description?: string;
    mapsId: string[];
    showOnMain: boolean;
    descColor?: "white" | "black" | "red" | "blue" | "green" | "yellow";
    isPublic: boolean;
    previewUrl?: string;
  },
  id?: string,
): Promise<Collection> => {
  return (
    await api.post(`collections/${id ? `${id}/update` : "create"}`, {
      title: data.title,
      description: data.description,
      mapsId: data.mapsId,
      showOnMain: data.showOnMain,
      descColor: data.descColor,
      isPublic: data.isPublic,
      previewUrl: data.previewUrl,
    })
  ).data;
};

export const deleteCollection = async (collectionId: string): Promise<string> => {
  return (await api.delete(`collections/${collectionId}/delete`)).data;
};

export const voteCollection = async (
  collectionId: string,
  type: Vote["type"],
): Promise<Vote> => {
  return (
    await api.post(`collections/${collectionId}/vote`, {
      vote: type,
    })
  ).data;
};

export const getVote = async (collectionId: string): Promise<Vote | null> => {
  return (await api.get(`collections/${collectionId}/vote`)).data;
};
