import { useQuery } from '@tanstack/react-query';
import { carbonService } from '@/services/carbon.service';
import { STALE_TIMES } from '@/constants/carbon';
import type { DashboardStats } from '@/types/carbon.types';

interface UseDashboardStatsReturn {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

export function useDashboardStats(): UseDashboardStatsReturn {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: carbonService.getDashboard,
    staleTime: STALE_TIMES.dashboard,
  });

  return { stats, isLoading };
}
