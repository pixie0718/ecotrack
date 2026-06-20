import { api } from './api';
import type { LoginCredentials, RegisterCredentials, AuthTokens, User } from '@/types/auth.types';

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data } = await api.post<{ data: AuthResponse }>('/auth/register', credentials);
    return data.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<{ data: AuthResponse }>('/auth/login', credentials);
    return data.data;
  },

  async logout(refreshToken?: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken });
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const { data } = await api.post<{ data: { tokens: AuthTokens } }>('/auth/refresh', {
      refreshToken,
    });
    return data.data.tokens;
  },

  async getMe(): Promise<{ id: string; email: string }> {
    const { data } = await api.get<{ data: { id: string; email: string } }>('/auth/me');
    return data.data;
  },
};
