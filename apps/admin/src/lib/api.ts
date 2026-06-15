import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type { ApiResponse, AuthTokens } from '@shopified/shared';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const ACCESS_TOKEN_KEY = 'shopified.accessToken';
export const REFRESH_TOKEN_KEY = 'shopified.refreshToken';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setTokens(tokens: AuthTokens): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearTokens(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Axios instance pointed at the backend REST API.
 *
 * - Request interceptor attaches the Bearer token from localStorage.
 * - Response interceptor unwraps the `{ success, data, timestamp }` envelope so
 *   callers receive `data` directly.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // Unwrap the standard API envelope when present.
    const body = response.data as ApiResponse | undefined;
    if (body && typeof body === 'object' && 'data' in body && 'success' in body) {
      response.data = body.data;
    }
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearTokens();
    }
    return Promise.reject(error);
  },
);

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.get<T>(url, config);
  return res.data;
}

export async function post<T>(
  url: string,
  payload?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await apiClient.post<T>(url, payload, config);
  return res.data;
}

export async function patch<T>(
  url: string,
  payload?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await apiClient.patch<T>(url, payload, config);
  return res.data;
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.delete<T>(url, config);
  return res.data;
}

/**
 * SWR fetcher helper.
 */
export const fetcher = <T>(url: string): Promise<T> => get<T>(url);

export interface LoginPayload {
  email: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<AuthTokens> {
  const tokens = await post<AuthTokens>('/auth/login', payload);
  setTokens(tokens);
  return tokens;
}

export function logout(): void {
  clearTokens();
}
