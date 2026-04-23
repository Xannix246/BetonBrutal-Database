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
export const addToast = (toast: Toast) =>
  $toasts.set([...$toasts.get(), toast]);
export const removeToast = (id: string) =>
  $toasts.set($toasts.get().filter((toast) => toast.id !== id));

api.interceptors.response.use(
  (response) => {
    const id = v4();
    const types: Toast["type"][] = ["info", "error", "warn", "success"];
    addToast({
      id: id,
      time: 50000,
      type: types[Math.floor(Math.random() * 4)],
      title: `Test ${id}`,
      description: "Notification was added succesfully"
    });
    return response;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);
