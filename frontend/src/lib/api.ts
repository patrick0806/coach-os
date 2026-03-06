import axios from "axios";

import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/auth-token";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error) || !error.config) {
      return Promise.reject(error);
    }

    const originalConfig = error.config as typeof error.config & { _retry?: boolean };
    const statusCode = error.response?.status;

    if (statusCode !== 401 || originalConfig._retry) {
      return Promise.reject(error);
    }

    originalConfig._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post<{ accessToken: string }>(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {},
            { withCredentials: true },
          )
          .then((response) => {
            setAccessToken(response.data.accessToken);
            return response.data.accessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;
      originalConfig.headers.Authorization = `Bearer ${newToken}`;

      return api(originalConfig);
    } catch (refreshError) {
      clearAccessToken();
      return Promise.reject(refreshError);
    }
  },
);
