import { Car, Zap, Utensils, ShoppingBag, Recycle } from 'lucide-react';
import type { CarbonCategory } from '@/types/carbon.types';
import React from 'react';

/** Paris Agreement monthly target per person (2 000 kg/year ÷ 12) */
export const PARIS_TARGET_KG_MONTH = 167;

/** CO₂ absorbed by one mature tree per year (IPCC estimate) */
export const TREE_ABSORPTION_KG_YEAR = 21;

export const TREE_ABSORPTION_KG_MONTH = TREE_ABSORPTION_KG_YEAR / 12;

export const DAY_MS = 86_400_000;

/** React-Query stale times in milliseconds */
export const STALE_TIMES = {
  dashboard:  5  * 60 * 1000,
  insights:   30 * 60 * 1000,
  activities: 2  * 60 * 1000,
} as const;

export const REDUCE_TIPS: Record<string, string> = {
  transport: `To cut transport emissions 🚗\n\n• Switch to public transit when possible\n• Walk / cycle for short trips (<5 km)\n• Carpool to halve your per-km emissions\n• Consider an electric or hybrid vehicle`,
  energy:    `To reduce energy emissions ⚡\n\n• Switch to LED bulbs (75% less energy)\n• Turn off devices on standby\n• Wash clothes in cold water\n• Increase renewable energy % in your profile`,
  food:      `To cut food emissions 🥗\n\n• Reduce beef (1 kg beef = 27 kg CO₂ vs 6.9 for chicken)\n• Have 2–3 meatless days per week\n• Buy local & seasonal produce\n• Reduce food waste (compost scraps)`,
  shopping:  `To reduce shopping emissions 🛍\n\n• Buy second-hand or refurbished\n• Choose quality over fast fashion\n• Repair instead of replace\n• Avoid single-use plastics`,
  waste:     `To cut waste emissions ♻️\n\n• Compost food scraps\n• Recycle paper, plastic, glass, metal\n• Donate items instead of binning\n• Buy in bulk to reduce packaging`,
};

/** Icon component for each carbon category — shared across Dashboard and LogActivity. */
export const CATEGORY_ICON_MAP: Record<CarbonCategory, React.ElementType> = {
  transport: Car,
  energy:    Zap,
  food:      Utensils,
  shopping:  ShoppingBag,
  waste:     Recycle,
};

/** Tailwind colour classes for each carbon category — shared across Dashboard and LogActivity. */
export const CATEGORY_STYLE_MAP: Record<CarbonCategory, string> = {
  transport: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
  energy:    'text-amber-500 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20',
  food:      'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
  shopping:  'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20',
  waste:     'text-red-500 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
};
