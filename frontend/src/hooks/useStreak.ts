import { useQuery } from '@tanstack/react-query';
import { carbonService } from '@/services/carbon.service';
import { calcStreak, DAY_MS, type StreakResult } from '@/utils/streak';
import { STALE_TIMES } from '@/constants/carbon';

const EMPTY_STREAK: StreakResult = {
  streak: 0,
  dots: Array(7).fill(false) as boolean[],
  loggedToday: false,
};

export function useStreak(): StreakResult {
  const sevenDaysAgo = new Date(Date.now() - 6 * DAY_MS).toISOString().split('T')[0];

  const { data: activities } = useQuery({
    queryKey: ['streak-dates', sevenDaysAgo],
    queryFn: () =>
      carbonService.getActivities({ startDate: sevenDaysAgo, limit: 100 }).then(r => r.data),
    staleTime: STALE_TIMES.dashboard,
  });

  return activities ? calcStreak(activities) : EMPTY_STREAK;
}
