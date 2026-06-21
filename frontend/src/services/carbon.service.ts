import { api } from './api';
import type {
  CarbonActivity,
  DashboardStats,
  UserProfile,
  AIInsights,
  Challenge,
  UserChallenge,
  CarbonCategory,
} from '@/types/carbon.types';

export interface LogActivityPayload {
  category: CarbonCategory;
  subcategory: string;
  description?: string;
  quantity: number;
  unit: string;
  date?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface DataSnapshot {
  totalMonthlyKg: number;
  categoryBreakdown: Record<string, number>;
  topActivities: Array<{ subcategory: string; co2Kg: number }>;
  monthlyTrend: Array<{ month: string; co2Kg: number }>;
}

export const carbonService = {
  async getDashboard(): Promise<DashboardStats> {
    const { data } = await api.get<{ data: DashboardStats }>('/carbon/dashboard');
    return data.data;
  },

  async logActivity(payload: LogActivityPayload): Promise<CarbonActivity> {
    const { data } = await api.post<{ data: CarbonActivity }>('/carbon/activities', payload);
    return data.data;
  },

  async getActivities(params?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<CarbonActivity>> {
    const { data } = await api.get<{ data: CarbonActivity[]; meta: PaginationMeta }>('/carbon/activities', { params });
    return { data: data.data, meta: data.meta };
  },

  async deleteActivity(id: string): Promise<void> {
    await api.delete(`/carbon/activities/${id}`);
  },

  async getProfile(): Promise<UserProfile | null> {
    const { data } = await api.get<{ data: UserProfile | null }>('/carbon/profile');
    return data.data;
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const { data } = await api.put<{ data: UserProfile }>('/carbon/profile', profile);
    return data.data;
  },

  async getInsights(): Promise<{ insights: AIInsights; dataSnapshot: DataSnapshot }> {
    const { data } = await api.get<{ data: { insights: AIInsights; dataSnapshot: DataSnapshot } }>('/carbon/insights');
    return data.data;
  },

  async getChallenges(): Promise<Challenge[]> {
    const { data } = await api.get<{ data: Challenge[] }>('/carbon/challenges');
    return data.data;
  },

  async getUserChallenges(): Promise<UserChallenge[]> {
    const { data } = await api.get<{ data: UserChallenge[] }>('/carbon/challenges/my');
    return data.data;
  },

  async joinChallenge(challengeId: string): Promise<UserChallenge> {
    const { data } = await api.post<{ data: UserChallenge }>(`/carbon/challenges/${challengeId}/join`);
    return data.data;
  },
};
