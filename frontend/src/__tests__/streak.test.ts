import { describe, it, expect } from 'vitest';
import { calcStreak, DAY_MS } from '@/utils/streak';
import type { CarbonActivity } from '@/types/carbon.types';

function makeActivity(daysAgo: number): CarbonActivity {
  const date = new Date(Date.now() - daysAgo * DAY_MS);
  return {
    id: `activity-${daysAgo}`,
    category: 'transport',
    subcategory: 'car_petrol_km',
    quantity: 10,
    unit: 'km',
    co2Kg: 1.92,
    date: date.toISOString(),
  };
}

describe('calcStreak', () => {
  it('returns zero streak and no dots for empty activity list', () => {
    const result = calcStreak([]);
    expect(result.streak).toBe(0);
    expect(result.loggedToday).toBe(false);
    expect(result.dots).toHaveLength(7);
    expect(result.dots.every(d => d === false)).toBe(true);
  });

  it('returns streak of 1 when only today is logged', () => {
    const result = calcStreak([makeActivity(0)]);
    expect(result.streak).toBe(1);
    expect(result.loggedToday).toBe(true);
    expect(result.dots[6]).toBe(true);
  });

  it('counts a consecutive streak correctly', () => {
    const activities = [makeActivity(0), makeActivity(1), makeActivity(2)];
    const result = calcStreak(activities);
    expect(result.streak).toBe(3);
  });

  it('breaks streak when a day is missing', () => {
    // Today logged, 2 days ago logged — yesterday missing
    const activities = [makeActivity(0), makeActivity(2)];
    const result = calcStreak(activities);
    expect(result.streak).toBe(1);
  });

  it('returns streak of 0 when yesterday was the last logged day', () => {
    const result = calcStreak([makeActivity(1)]);
    expect(result.streak).toBe(0);
    expect(result.loggedToday).toBe(false);
  });

  it('deduplicates multiple activities on the same day', () => {
    const activities = [makeActivity(0), makeActivity(0), makeActivity(0)];
    const result = calcStreak(activities);
    expect(result.streak).toBe(1);
  });

  it('always returns exactly 7 dots', () => {
    const result = calcStreak([makeActivity(0), makeActivity(5)]);
    expect(result.dots).toHaveLength(7);
  });
});
