// Carbon emission factors (kg CO2e per unit)
// Sources: IPCC, EPA, GHG Protocol

/** Average CO₂ absorbed by one mature tree per year — USDA Forest Service estimate */
export const KG_CO2_PER_TREE_PER_YEAR = 21;

/** Average single-trip flight distance in km for baseline footprint estimation */
const AVG_FLIGHT_DISTANCE_KM = 800;

/** Default annual CO₂ from shopping/consumer goods (kg) — Source: WRAP 2020 */
const DEFAULT_ANNUAL_SHOPPING_KG_CO2 = 1800;

export const EMISSION_FACTORS = {
  transport: {
    car_petrol_km: 0.192,          // kg CO2e/km
    car_diesel_km: 0.171,
    car_hybrid_km: 0.105,
    car_electric_km: 0.053,
    motorcycle_km: 0.114,
    bus_km: 0.089,
    train_km: 0.041,
    metro_km: 0.030,
    flight_short_km: 0.255,        // < 1500km
    flight_medium_km: 0.195,       // 1500-4000km
    flight_long_km: 0.150,         // > 4000km
    ship_km: 0.019,
    taxi_km: 0.211,
  },
  energy: {
    electricity_kwh: 0.233,        // kg CO2e/kWh (world avg)
    natural_gas_kwh: 0.202,
    natural_gas_m3: 2.204,
    heating_oil_liter: 2.753,
    lpg_liter: 1.630,
    coal_kg: 2.420,
  },
  food: {
    beef_kg: 27.0,
    lamb_kg: 39.2,
    pork_kg: 12.1,
    chicken_kg: 6.9,
    fish_avg_kg: 6.1,
    dairy_kg: 3.2,
    eggs_kg: 4.8,
    vegetables_kg: 2.0,
    fruits_kg: 1.1,
    grains_kg: 1.4,
    legumes_kg: 0.9,
    nuts_kg: 2.3,
    tofu_kg: 2.0,
    coffee_kg: 17.0,
    beer_liter: 0.74,
    wine_liter: 1.79,
  },
  shopping: {
    clothing_item: 10.0,           // avg kg CO2e per clothing item
    electronics_small: 30.0,      // phone, tablet, etc.
    electronics_large: 200.0,     // laptop, TV, etc.
    furniture_item: 44.0,
    new_car_unit: 6000.0,
    streaming_hour: 0.036,        // kg CO2e/hour of streaming
    online_shopping_pkg: 0.5,     // avg delivery package
  },
  waste: {
    landfill_kg: 0.467,
    recycling_kg: -0.150,         // negative = savings
    composting_kg: -0.060,
    food_waste_kg: 0.250,
  },
} as const;

export type TransportMode = keyof typeof EMISSION_FACTORS.transport;
export type FoodType = keyof typeof EMISSION_FACTORS.food;
export type EnergyType = keyof typeof EMISSION_FACTORS.energy;

export interface ActivityInput {
  category: 'transport' | 'energy' | 'food' | 'shopping' | 'waste';
  subcategory: string;
  quantity: number;
  unit: string;
}

export function calculateCO2(input: ActivityInput): number {
  const { category, subcategory, quantity } = input;
  const factors = EMISSION_FACTORS[category] as Record<string, number>;
  const factor = factors[subcategory] ?? 0;
  return Math.round(quantity * factor * 1000) / 1000;
}

export interface ProfileData {
  dietType: string;
  vehicleType?: string | null;
  weeklyCarKm: number;
  monthlyElectricityKwh: number;
  monthlyGasM3: number;
  monthlyFlights: number;
  householdSize: number;
  renewableEnergyPct: number;
}

export function estimateAnnualFootprint(profile: ProfileData): number {
  let total = 0;

  // Transport
  if (profile.vehicleType && profile.vehicleType !== 'none') {
    const factor = EMISSION_FACTORS.transport[
      `car_${profile.vehicleType}_km` as TransportMode
    ] ?? EMISSION_FACTORS.transport.car_petrol_km;
    total += profile.weeklyCarKm * 52 * factor;
  }
  total += profile.monthlyFlights * 12 * AVG_FLIGHT_DISTANCE_KM * EMISSION_FACTORS.transport.flight_medium_km;

  // Energy (adjusted for renewable energy percentage)
  const energyFactor = 1 - (profile.renewableEnergyPct / 100) * 0.8;
  total += profile.monthlyElectricityKwh * 12 * EMISSION_FACTORS.energy.electricity_kwh * energyFactor;
  total += profile.monthlyGasM3 * 12 * EMISSION_FACTORS.energy.natural_gas_m3;

  // Food (annual averages by diet type)
  const foodFootprints: Record<string, number> = {
    vegan: 1500,
    vegetarian: 1700,
    pescatarian: 1900,
    omnivore: 2500,
    heavy_meat: 3300,
  };
  total += foodFootprints[profile.dietType] ?? foodFootprints.omnivore;

  // Shopping (estimated average)
  total += DEFAULT_ANNUAL_SHOPPING_KG_CO2;

  // Per-person (shared household costs)
  const householdShared = (total * 0.3) / Math.max(profile.householdSize, 1);
  const personal = total * 0.7;

  return Math.round((personal + householdShared) * 100) / 100;
}

export function toTreeEquivalent(co2Kg: number): number {
  return Math.round((co2Kg / KG_CO2_PER_TREE_PER_YEAR) * 100) / 100;
}

export function toKmDrivenEquivalent(co2Kg: number): number {
  return Math.round((co2Kg / EMISSION_FACTORS.transport.car_petrol_km) * 10) / 10;
}

export function getCategoryBreakdown(activities: Array<{ category: string; co2Kg: number }>) {
  const breakdown: Record<string, number> = {
    transport: 0,
    energy: 0,
    food: 0,
    shopping: 0,
    waste: 0,
  };

  for (const activity of activities) {
    breakdown[activity.category] = (breakdown[activity.category] ?? 0) + activity.co2Kg;
  }

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return Object.entries(breakdown).map(([category, co2]) => ({
    category,
    co2Kg: Math.round(co2 * 1000) / 1000,
    percentage: total > 0 ? Math.round((co2 / total) * 1000) / 10 : 0,
  }));
}

// Global averages (kg CO2e/year per person)
export const GLOBAL_AVERAGES = {
  world: 4800,
  usa: 14700,
  eu: 7100,
  india: 1900,
  uk: 7200,
  china: 7200,
  target_paris: 2000, // 2030 Paris Agreement target
} as const;
