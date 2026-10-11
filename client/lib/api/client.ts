import axios, { type InternalAxiosRequestConfig } from 'axios';
import { type ApiSuccessResponse, type AuthResponse } from './types';

const BASE_URL = 'http://localhost:5000/api/v1';

let accessToken: string | null = null;
let onSessionExpired: (() => void) | null = null;
let refreshPromise: Promise<AuthResponse> | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const setSessionExpiredHandler = (handler: (() => void) | null) => {
  onSessionExpired = handler;
};


export const refreshSession = (): Promise<AuthResponse> => {
  refreshPromise ??= axios
    .post<ApiSuccessResponse<AuthResponse>>(`${BASE_URL}/auth/refresh`, undefined, {
      withCredentials: true,
    })
    .then((response) => {
      accessToken = response.data.data.token;
      return response.data.data;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

const NO_REFRESH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config) {
      return Promise.reject(error);
    }

    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const skipRefresh = NO_REFRESH_PATHS.some((path) => original.url?.startsWith(path));

    if (error.response?.status !== 401 || original._retry || skipRefresh) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const { token } = await refreshSession();
      original.headers.Authorization = `Bearer ${token}`;
      return apiClient(original);
    } catch {
      onSessionExpired?.();
      return Promise.reject(error);
    }
  },
);