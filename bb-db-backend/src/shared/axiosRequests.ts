import { Logger } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { AxiosError } from 'axios';

const logger = new Logger('ResponseLogger');

export async function safeGet<T>(
  url: string,
  timeout = 5000,
  config?: AxiosRequestConfig,
): Promise<T | null> {
  try {
    return (await axios.get<T>(url, { timeout, ...config })).data;
  } catch (err: unknown) {
    logger.warn({
      url: url,
      message: 'Failed to GET URL, returning null',
      status: (err as AxiosError).response?.status,
      code: (err as AxiosError).code,
      axiosMessage: (err as AxiosError).message,
    });
    return null;
  }
}

export async function safePost<T>(
  url: string,
  data?: unknown,
  timeout = 5000,
  config?: AxiosRequestConfig,
): Promise<T | null> {
  try {
    return (await axios.post<T>(url, data, { timeout, ...config })).data;
  } catch (err) {
    logger.warn({
      url: url,
      message: 'Failed to POST URL, returning null',
      status: (err as AxiosError).response?.status,
      code: (err as AxiosError).code,
      axiosMessage: (err as AxiosError).message,
    });
    return null;
  }
}
