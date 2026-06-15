import axios, { AxiosError, type AxiosInstance } from 'axios';
import type { ApiResponse } from '@shopified/shared';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || 'demo-store';

/**
 * Axios instance for the Shopified backend. Storefront-facing endpoints
 * require an `x-store-id` header. Successful responses are unwrapped from the
 * `{ success, data, timestamp }` envelope so callers receive `data` directly.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    'x-store-id': STORE_ID,
  },
});

// Attach a customer access token if one is present (client side only).
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('storefront_token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse | undefined;
    if (body && typeof body === 'object' && 'data' in body && 'success' in body) {
      // Unwrap the standard envelope.
      response.data = body.data;
    }
    return response;
  },
  (error: AxiosError) => Promise.reject(error),
);

/** GET helper that returns the unwrapped data payload. */
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await apiClient.get<T>(url, { params });
  return res.data;
}

/** POST helper that returns the unwrapped data payload. */
export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const res = await apiClient.post<T>(url, body);
  return res.data;
}

export { STORE_ID };
