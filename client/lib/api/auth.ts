import { apiClient } from './client';
import {
  type ApiSuccessResponse,
  type AuthResponse,
  type LoginPayload,
  type RegisterPayload,
  type User,
} from './types';

export const authApi = {
  async login(data: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>('/auth/login', data);
    return response.data.data;
  },

  async register(data: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
      '/auth/register',
      data,
    );
    return response.data.data;
  },

  async getCurrentUser(): Promise<AuthResponse> {
    const response = await apiClient.get<ApiSuccessResponse<AuthResponse>>('/auth/me');
    const data = response.data.data;

    if(data.token && typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
    }

    return data;
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
  const response = await apiClient.get<ApiSuccessResponse<{ message: string }>>(
    '/auth/verify-email',
    { params: { token } },
  );
  return response.data.data;
}
};