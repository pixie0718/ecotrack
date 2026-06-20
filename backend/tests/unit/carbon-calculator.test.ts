import {
  calculateCO2,
  estimateAnnualFootprint,
  toTreeEquivalent,
  getCategoryBreakdown,
  EMISSION_FACTORS,
} from '../../src/utils/carbon-calculator';

describe('Carbon Calculator', () => {
  describe('calculateCO2', () => {
    it('calculates petrol car emissions correctly', () => {
      const result = calculateCO2({
        category: 'transport',
        subcategory: 'car_petrol_km',
        quantity: 100,
        unit: 'km',
      });
      expect(result).toBeCloseTo(100 * EMISSION_FACTORS.transport.car_petrol_km, 3);
    });

    it('calculates electricity emissions', () => {
      const result = calculateCO2({
        category: 'energy',
        subcategory: 'electricity_kwh',
        quantity: 200,
        unit: 'kWh',
      });
      expect(result).toBeCloseTo(200 * EMISSION_FACTORS.energy.electricity_kwh, 3);
    });

    it('returns 0 for unknown subcategory', () => {
      const result = calculateCO2({
        category: 'transport',
        subcategory: 'unknown_vehicle',
        quantity: 100,
        unit: 'km',
      });
      expect(result).toBe(0);
    });

    it('handles zero quantity', () => {
      const result = calculateCO2({
        category: 'food',
        subcategory: 'beef_kg',
        quantity: 0,
        unit: 'kg',
      });
      expect(result).toBe(0);
    });
  });

  describe('estimateAnnualFootprint', () => {
    it('estimates footprint for vegan diet', () => {
      const result = estimateAnnualFootprint({
        dietType: 'vegan',
        vehicleType: 'none',
        weeklyCarKm: 0,
        monthlyElectricityKwh: 150,
        monthlyGasM3: 0,
        monthlyFlights: 0,
        householdSize: 1,
        renewableEnergyPct: 0,
      });
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(10000); // sanity check
    });

    it('estimates higher footprint for heavy meat diet', () => {
      const veganResult = estimateAnnualFootprint({
        dietType: 'vegan',
        vehicleType: null,
        weeklyCarKm: 0,
        monthlyElectricityKwh: 100,
        monthlyGasM3: 0,
        monthlyFlights: 0,
        householdSize: 1,
        renewableEnergyPct: 0,
      });

      const meatResult = estimateAnnualFootprint({
        dietType: 'heavy_meat',
        vehicleType: null,
        weeklyCarKm: 0,
        monthlyElectricityKwh: 100,
        monthlyGasM3: 0,
        monthlyFlights: 0,
        householdSize: 1,
        renewableEnergyPct: 0,
      });

      expect(meatResult).toBeGreaterThan(veganResult);
    });

    it('renewable energy reduces footprint', () => {
      const noRenewable = estimateAnnualFootprint({
        dietType: 'omnivore',
        vehicleType: null,
        weeklyCarKm: 0,
        monthlyElectricityKwh: 300,
        monthlyGasM3: 0,
        monthlyFlights: 0,
        householdSize: 1,
        renewableEnergyPct: 0,
      });

      const fullRenewable = estimateAnnualFootprint({
        dietType: 'omnivore',
        vehicleType: null,
        weeklyCarKm: 0,
        monthlyElectricityKwh: 300,
        monthlyGasM3: 0,
        monthlyFlights: 0,
        householdSize: 1,
        renewableEnergyPct: 100,
      });

      expect(fullRenewable).toBeLessThan(noRenewable);
    });
  });

  describe('toTreeEquivalent', () => {
    it('converts kg CO2 to tree equivalents', () => {
      expect(toTreeEquivalent(21)).toBeCloseTo(1, 1);
      expect(toTreeEquivalent(210)).toBeCloseTo(10, 1);
    });

    it('handles zero', () => {
      expect(toTreeEquivalent(0)).toBe(0);
    });
  });

  describe('getCategoryBreakdown', () => {
    it('aggregates activities by category', () => {
      const activities = [
        { category: 'transport', co2Kg: 10 },
        { category: 'transport', co2Kg: 5 },
        { category: 'food', co2Kg: 20 },
      ];

      const breakdown = getCategoryBreakdown(activities);
      const transport = breakdown.find((b) => b.category === 'transport');
      const food = breakdown.find((b) => b.category === 'food');

      expect(transport?.co2Kg).toBeCloseTo(15, 2);
      expect(food?.co2Kg).toBeCloseTo(20, 2);
      expect(transport?.percentage).toBeCloseTo(42.9, 0);
      expect(food?.percentage).toBeCloseTo(57.1, 0);
    });

    it('handles empty activities', () => {
      const breakdown = getCategoryBreakdown([]);
      expect(breakdown.every((b) => b.co2Kg === 0)).toBe(true);
    });
  });
});
