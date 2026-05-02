import { useStore } from "@nanostores/react";
import { atom } from "nanostores";
import { api } from "../features/Auth";
import { v4 } from "uuid";
import { AxiosError } from "axios";

export type Toast = {
  id: string;
  time: number;
  type: "error" | "warn" | "success" | "info";
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  buttons?: React.ReactNode[];
};

export const $toasts = atom<Toast[]>([]);
export const getToasts = () => useStore($toasts);
export const getToast = (id: string) =>
  $toasts.get().find((toast) => toast.id === id);

export const clearToasts = () => $toasts.set([]);
export const addToast = (toast: Toast) => {
  const current = $toasts.get();
  const next = [...current, toast];
  $toasts.set(next.slice(-5));
};
export const removeToast = (id: string) =>
  $toasts.set($toasts.get().filter((toast) => toast.id !== id));

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    addToast({
      id: v4(),
      time: 5000,
      type: "error",
      title: "An error occured",
      description: `${(error.response?.data as { message: string })?.message || error.message}`,
    });
    return Promise.reject(error);
  },
);
