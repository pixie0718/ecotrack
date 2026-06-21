import React, { useState } from 'react';
import { Calculator as CalcIcon, Leaf, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCO2 } from '@/utils/formatters';
import { TREE_ABSORPTION_KG_YEAR } from '@/constants/carbon';

const FACTORS: Record<string, Record<string, { factor: number; unit: string; label: string }>> = {
  Transport: {
    car_petrol_km:   { factor: 0.192, unit: 'km',  label: 'Petrol car' },
    car_electric_km: { factor: 0.053, unit: 'km',  label: 'Electric car' },
    bus_km:          { factor: 0.089, unit: 'km',  label: 'Bus' },
    train_km:        { factor: 0.041, unit: 'km',  label: 'Train' },
    flight_short_km: { factor: 0.255, unit: 'km',  label: 'Short flight' },
    flight_long_km:  { factor: 0.150, unit: 'km',  label: 'Long-haul flight' },
  },
  Energy: {
    electricity_kwh:    { factor: 0.233, unit: 'kWh', label: 'Electricity' },
    natural_gas_m3:     { factor: 2.204, unit: 'm³',  label: 'Natural gas' },
    heating_oil_liter:  { factor: 2.753, unit: 'L',   label: 'Heating oil' },
  },
  Food: {
    beef_kg:       { factor: 27.0, unit: 'kg', label: 'Beef' },
    chicken_kg:    { factor: 6.9,  unit: 'kg', label: 'Chicken' },
    vegetables_kg: { factor: 2.0,  unit: 'kg', label: 'Vegetables' },
  },
};

interface CalcItem {
  category: string;
  key: string;
  quantity: number;
  co2: number;
}

const Calculator: React.FC = () => {
  const [items,       setItems]       = useState<CalcItem[]>([]);
  const [category,    setCategory]    = useState('Transport');
  const [activityKey, setActivityKey] = useState('car_petrol_km');
  const [quantity,    setQuantity]    = useState('');

  const selectedActivity = FACTORS[category]?.[activityKey];

  const addItem = () => {
    if (!quantity || !selectedActivity) return;
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) return;
    setItems((prev) => [...prev, { category, key: activityKey, quantity: qty, co2: qty * selectedActivity.factor }]);
    setQuantity('');
  };

  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const totalCO2       = items.reduce((sum, item) => sum + item.co2, 0);
  const treeEquivalent = totalCO2 / TREE_ABSORPTION_KG_YEAR;

  const categoryOptions = Object.keys(FACTORS).map((k) => ({ value: k, label: k }));
  const activityOptions = Object.entries(FACTORS[category] ?? {}).map(([k, v]) => ({
    value: k, label: `${v.label} (per ${v.unit})`,
  }));

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-carbon-900 dark:text-white flex items-center gap-2">
          <CalcIcon className="h-6 w-6 text-blue-600" />
          Carbon Calculator
        </h1>
        <p className="text-carbon-500 dark:text-carbon-400 mt-1">
          Estimate the carbon footprint of specific activities
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Add Activities</CardTitle></CardHeader>
        <div className="space-y-4">
          <Select
            label="Category"
            options={categoryOptions}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setActivityKey(Object.keys(FACTORS[e.target.value] ?? {})[0] ?? '');
            }}
          />
          <Select
            label="Activity"
            options={activityOptions}
            value={activityKey}
            onChange={(e) => setActivityKey(e.target.value)}
          />
          <Input
            label={`Quantity (${selectedActivity?.unit ?? ''})`}
            type="number"
            min="0"
            step="0.1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter amount"
          />
          {quantity && selectedActivity && (
            <div className="p-3 rounded-lg text-sm
                            bg-green-50 text-green-700
                            dark:bg-green-900/20 dark:text-green-400 dark:border dark:border-green-800">
              Preview: <strong>{formatCO2(parseFloat(quantity) * selectedActivity.factor)}</strong> CO₂e
            </div>
          )}
          <Button onClick={addItem} disabled={!quantity || !selectedActivity}>
            Add to Calculation
          </Button>
        </div>
      </Card>

      {items.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Calculation Results</CardTitle>
              <button
                onClick={() => setItems([])}
                className="text-sm flex items-center gap-1 transition-colors
                           text-carbon-400 hover:text-carbon-600
                           dark:text-carbon-500 dark:hover:text-carbon-300"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Clear all
              </button>
            </div>
          </CardHeader>

          <div className="space-y-2 mb-4">
            {items.map((item, i) => {
              const info = FACTORS[item.category]?.[item.key];
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg
                                        bg-carbon-50 dark:bg-carbon-700/50">
                  <div>
                    <p className="text-sm font-medium text-carbon-800 dark:text-carbon-200">
                      {info?.label ?? item.key}
                    </p>
                    <p className="text-xs text-carbon-400 dark:text-carbon-500">
                      {item.quantity} {info?.unit} × {info?.factor} kg CO₂/{info?.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-carbon-700 dark:text-carbon-300">
                      {formatCO2(item.co2)}
                    </span>
                    <button
                      onClick={() => removeItem(i)}
                      className="text-xs ml-2 transition-colors text-carbon-300 hover:text-red-400 dark:text-carbon-600 dark:hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-carbon-200 dark:border-carbon-700 pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-carbon-900 dark:text-white">Total CO₂e</span>
              <span className="text-xl font-bold text-carbon-900 dark:text-white">{formatCO2(totalCO2)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Leaf className="h-4 w-4" />
              <span>≈ {treeEquivalent.toFixed(1)} trees needed to offset this for 1 year</span>
            </div>
            <div className="mt-3 text-xs text-carbon-400 dark:text-carbon-500">
              Global average: ~4,800 kg CO₂e/year · Paris target: ~2,000 kg CO₂e/year
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Calculator;
