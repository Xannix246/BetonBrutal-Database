import { config } from "../../../config/config";
import { api } from "../../features/Auth";
import { $doc, $files, setDoc } from "../../store/store";

export const uploadFiles = async () => {
  const files = $files.get();
  let article = $doc.get();

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post(
      `${config.serverUri}/files/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    const encodedName = encodeURIComponent(file.name);

    const regex = new RegExp(
      `!\\[(.*?)\\]\\(${encodedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`,
      "g"
    );

    article = article.replace(regex, `![$1](${config.baseAuthUrl}${data.url})`);
  }

  setDoc(article);
};

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post(
    `${config.serverUri}/files/upload`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return data;
};

export const uploadArticle = async (
  title: string,
  description?: string,
  tags: string[] = [],
  preview?: File | null
) => {
  const article = $doc.get();

  const data = (
    await api.post(`${config.serverUri}/articles/new-article`, {
      title,
      description,
      content: article,
      tags,
      preview: preview
        ? `${config.baseAuthUrl}${(await uploadFile(preview)).url}`
        : undefined,
      attachments: [],
    })
  ).data;

  return data.id;
};

export const getArticle = async (id: string) => {
  try {
    const data: Article | null = (
      await api.get(`${config.serverUri}/articles/${id}`)
    ).data;
    return data;
  } catch {
    return null;
  }
};

export const getArticles = async (
  sortBy: SortBy = "newest", // newest or oldest
  quantity: number = 50,
  timeRange?: "day" | "week" | "month" | "year",
  page: number = 1,
  tags?: string[],
  strictComparison?: boolean,
  searchText?: string
) => {
  const data: Article[] = (
    await api.get(
      `${config.serverUri}/articles/get-articles?sortBy=${sortBy}&quantity=${quantity}&timeRange=${timeRange}&page=${page}&tags=${tags}&strictComparison=${strictComparison}&searchText=${searchText}`
    )
  ).data;

  return data;
};
