export type CarbonCategory = 'transport' | 'energy' | 'food' | 'shopping' | 'waste';

export interface CarbonActivity {
  id: string;
  category: CarbonCategory;
  subcategory: string;
  description?: string;
  quantity: number;
  unit: string;
  co2Kg: number;
  date: string;
  treeEquivalent?: number;
  metadata?: Record<string, unknown>;
}

export interface CategoryBreakdown {
  category: string;
  co2Kg: number;
  percentage: number;
}

export interface MonthlyTrend {
  year: number;
  month: number;
  label: string;
  co2Kg: number;
  treeEquivalent: number;
}

export interface DashboardStats {
  today: { co2Kg: number; treeEquivalent: number };
  thisWeek: { co2Kg: number };
  thisMonth: {
    co2Kg: number;
    treeEquivalent: number;
    changePct: number | null;
    breakdown: Record<CarbonCategory, number>;
  };
  reductionFromBaseline: number | null;
  globalComparison: {
    world: number;
    paris_target: number;
  };
  monthlyTrend: MonthlyTrend[];
  recentActivities: CarbonActivity[];
}

export interface UserProfile {
  dietType: string;
  vehicleType: string | null;
  homeSize: string | null;
  householdSize: number;
  renewableEnergyPct: number;
  monthlyFlights: number;
  weeklyCarKm: number;
  monthlyElectricityKwh: number;
  monthlyGasM3: number;
  baselineFootprint: number | null;
  targetReduction: number;
}

export interface PersonalizedTip {
  category: string;
  tip: string;
  potentialSavingKg: number;
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'high' | 'medium' | 'low';
}

export interface AIInsights {
  summary: string;
  topImpactAreas: string[];
  personalizedTips: PersonalizedTip[];
  weeklyChallenge: {
    title: string;
    description: string;
    estimatedSaving: number;
  };
  motivationalMessage: string;
  comparisonToAverage: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  durationDays: number;
  co2Savings: number;
  points: number;
  tips: string[];
}

export interface UserChallenge {
  id: string;
  challengeId: string;
  status: 'active' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
  progressPct: number;
  challenge: Challenge;
}

export const CATEGORY_LABELS: Record<CarbonCategory, string> = {
  transport: 'Transport',
  energy: 'Energy',
  food: 'Food & Diet',
  shopping: 'Shopping',
  waste: 'Waste',
};

export const CATEGORY_COLORS: Record<CarbonCategory, string> = {
  transport: '#3b82f6',
  energy: '#f59e0b',
  food: '#22c55e',
  shopping: '#8b5cf6',
  waste: '#ef4444',
};

export const CATEGORY_ICONS: Record<CarbonCategory, string> = {
  transport: '🚗',
  energy: '⚡',
  food: '🍽️',
  shopping: '🛍️',
  waste: '♻️',
};

export const SUBCATEGORY_OPTIONS: Record<CarbonCategory, Array<{ value: string; label: string; unit: string }>> = {
  transport: [
    { value: 'car_petrol_km', label: 'Petrol Car', unit: 'km' },
    { value: 'car_diesel_km', label: 'Diesel Car', unit: 'km' },
    { value: 'car_electric_km', label: 'Electric Car', unit: 'km' },
    { value: 'car_hybrid_km', label: 'Hybrid Car', unit: 'km' },
    { value: 'bus_km', label: 'Bus', unit: 'km' },
    { value: 'train_km', label: 'Train', unit: 'km' },
    { value: 'metro_km', label: 'Metro/Subway', unit: 'km' },
    { value: 'flight_short_km', label: 'Short Flight (<1500km)', unit: 'km' },
    { value: 'flight_medium_km', label: 'Medium Flight', unit: 'km' },
    { value: 'flight_long_km', label: 'Long-haul Flight', unit: 'km' },
    { value: 'motorcycle_km', label: 'Motorcycle', unit: 'km' },
  ],
  energy: [
    { value: 'electricity_kwh', label: 'Electricity', unit: 'kWh' },
    { value: 'natural_gas_kwh', label: 'Natural Gas (kWh)', unit: 'kWh' },
    { value: 'natural_gas_m3', label: 'Natural Gas (m³)', unit: 'm³' },
    { value: 'heating_oil_liter', label: 'Heating Oil', unit: 'liters' },
    { value: 'lpg_liter', label: 'LPG', unit: 'liters' },
  ],
  food: [
    { value: 'beef_kg', label: 'Beef', unit: 'kg' },
    { value: 'lamb_kg', label: 'Lamb', unit: 'kg' },
    { value: 'pork_kg', label: 'Pork', unit: 'kg' },
    { value: 'chicken_kg', label: 'Chicken', unit: 'kg' },
    { value: 'fish_avg_kg', label: 'Fish (average)', unit: 'kg' },
    { value: 'dairy_kg', label: 'Dairy Products', unit: 'kg' },
    { value: 'vegetables_kg', label: 'Vegetables', unit: 'kg' },
    { value: 'coffee_kg', label: 'Coffee', unit: 'kg' },
  ],
  shopping: [
    { value: 'clothing_item', label: 'Clothing Item', unit: 'items' },
    { value: 'electronics_small', label: 'Small Electronics', unit: 'items' },
    { value: 'electronics_large', label: 'Large Electronics', unit: 'items' },
    { value: 'streaming_hour', label: 'Video Streaming', unit: 'hours' },
    { value: 'online_shopping_pkg', label: 'Online Shopping Package', unit: 'packages' },
  ],
  waste: [
    { value: 'landfill_kg', label: 'Landfill Waste', unit: 'kg' },
    { value: 'recycling_kg', label: 'Recycling (savings)', unit: 'kg' },
    { value: 'composting_kg', label: 'Composting (savings)', unit: 'kg' },
    { value: 'food_waste_kg', label: 'Food Waste', unit: 'kg' },
  ],
};
