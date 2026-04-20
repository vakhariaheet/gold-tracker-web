import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7568';

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  private normalizeToken(token: string | null): string | null {
    if (!token) return null;
    const normalized = token.trim();
    if (!normalized || normalized === 'undefined' || normalized === 'null') {
      return null;
    }
    return normalized;
  }

  private getAccessToken(): string | null {
    return this.normalizeToken(localStorage.getItem('accessToken'))
      ?? this.normalizeToken(localStorage.getItem('token'));
  }

  private getRefreshToken(): string | null {
    return this.normalizeToken(localStorage.getItem('refreshToken'));
  }

  private isAuthEndpoint(url?: string): boolean {
    if (!url) return false;
    return url.includes('/api/auth/');
  }

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 15000,
    });

    this.client.interceptors.request.use((config) => {
      const token = this.getAccessToken();
      if (token) {
        if (typeof (config.headers as any)?.set === 'function') {
          (config.headers as any).set('Authorization', `Bearer ${token}`);
        } else {
          (config.headers as any).Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const requestUrl: string | undefined = originalRequest?.url;
        const hasRefreshToken = !!this.getRefreshToken();
        const isRefreshRequest = requestUrl?.includes('/api/auth/refresh-token');
        const shouldAttemptRefresh =
          status === 401 &&
          !!originalRequest &&
          !originalRequest._retry &&
          !this.isAuthEndpoint(requestUrl) &&
          !isRefreshRequest &&
          hasRefreshToken;

        if (shouldAttemptRefresh) {
          originalRequest._retry = true;
          try {
            const newToken = await this.refreshToken();
            if (typeof (originalRequest.headers as any)?.set === 'function') {
              (originalRequest.headers as any).set('Authorization', `Bearer ${newToken}`);
            } else {
              (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;
            }
            return this.client(originalRequest);
          } catch(err) {
            console.error('Token refresh failed:', err);
            // localStorage.removeItem('accessToken');
            // localStorage.removeItem('refreshToken');
            // if (window.location.pathname !== '/login') {
            //   window.location.assign('/login');
            // }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<string> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('Missing refresh token');
      }
      const response = await axios.post(`${BASE_URL}/api/auth/refresh-token`, { refreshToken });
      const accessToken = this.normalizeToken(response.data?.accessToken ?? response.data?.token);
      if (!accessToken) {
        throw new Error('Invalid access token from refresh response');
      }
      localStorage.setItem('accessToken', accessToken);
      return accessToken;
    })().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
