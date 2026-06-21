import type { CarbonActivity } from '@/types/carbon.types';

export interface StreakResult {
  streak: number;
  dots: boolean[];
  loggedToday: boolean;
}

export const DAY_MS = 86_400_000;

function dayTimestamp(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function calcStreak(activities: CarbonActivity[]): StreakResult {
  const today = dayTimestamp(new Date());

  const activeDays = new Set(
    activities.map(a => dayTimestamp(new Date(a.date)))
  );

  const dots = Array.from({ length: 7 }, (_, i) =>
    activeDays.has(today - (6 - i) * DAY_MS)
  );

  const loggedToday = activeDays.has(today);

  let streak = 0;
  if (loggedToday) {
    let check = today;
    while (activeDays.has(check)) {
      streak++;
      check -= DAY_MS;
    }
  }

  return { streak, dots, loggedToday };
}
