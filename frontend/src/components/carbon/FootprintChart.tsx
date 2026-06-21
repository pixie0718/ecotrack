import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useThemeStore } from '@/store/themeStore';
import { CATEGORY_COLORS, CATEGORY_LABELS, type CarbonCategory } from '@/types/carbon.types';
import { formatMonthLabel } from '@/utils/formatters';

interface TrendChartProps {
  data: Array<{ year: number; month: number; label: string; co2Kg: number }>;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  const gridColor   = isDark ? '#334155' : '#f1f5f9';
  const axisColor   = isDark ? '#64748b' : '#94a3b8';
  const axisLine    = isDark ? '#334155' : '#e2e8f0';
  const tooltipBg   = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';
  const tooltipText = isDark ? '#f1f5f9' : '#0f172a';

  const chartData = data.map((d) => ({
    ...d,
    label: formatMonthLabel(d.year, d.month),
    co2: Math.round(d.co2Kg * 10) / 10,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Carbon Footprint Trend</CardTitle>
        <p className="text-sm text-carbon-500 dark:text-carbon-400">kg CO₂e per month</p>
      </CardHeader>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#22c55e" stopOpacity={isDark ? 0.4 : 0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: axisColor }}
            axisLine={{ stroke: axisLine }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: axisColor }}
            axisLine={false}
            tickLine={false}
            width={45}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: '8px',
              fontSize: '12px',
              color: tooltipText,
            }}
            formatter={(value: number) => [`${value} kg CO₂e`, 'Footprint']}
          />
          <Area
            type="monotone"
            dataKey="co2"
            stroke="#22c55e"
            strokeWidth={2.5}
            fill="url(#co2Gradient)"
            dot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

interface CategoryPieProps {
  data: Array<{ category: string; co2Kg: number; percentage: number }>;
}

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const CategoryPieChart: React.FC<CategoryPieProps> = ({ data }) => {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  const tooltipBg     = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';
  const tooltipText   = isDark ? '#f1f5f9' : '#0f172a';
  const legendColor   = isDark ? '#94a3b8' : '#475569';

  const chartData = data
    .filter((d) => d.co2Kg > 0)
    .map((d) => ({
      name:  CATEGORY_LABELS[d.category as CarbonCategory] ?? d.category,
      value: Math.round(d.co2Kg * 10) / 10,
      color: CATEGORY_COLORS[d.category as CarbonCategory] ?? '#94a3b8',
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Category Breakdown</CardTitle></CardHeader>
        <div className="h-48 flex items-center justify-center text-carbon-400 dark:text-carbon-500 text-sm">
          No data yet. Start logging activities!
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <p className="text-sm text-carbon-500 dark:text-carbon-400">This month's emissions by source</p>
      </CardHeader>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%" cy="50%"
            innerRadius={55} outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
          >
            {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: '8px',
              fontSize: '12px',
              color: tooltipText,
            }}
            formatter={(value: number) => [`${value} kg CO₂e`, 'Emissions']}
          />
          <Legend formatter={(value) => (
            <span style={{ fontSize: '12px', color: legendColor }}>{value}</span>
          )} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};
