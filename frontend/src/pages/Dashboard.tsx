import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Leaf, Zap, Trees, TrendingDown, Globe } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TrendChart, CategoryPieChart } from '@/components/carbon/FootprintChart';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { carbonService } from '@/services/carbon.service';
import { useAuthStore } from '@/store/authStore';
import { formatCO2, formatRelativeDate, formatPercentage } from '@/utils/formatters';
import { CATEGORY_ICONS, CATEGORY_LABELS, type CarbonCategory } from '@/types/carbon.types';

const Dashboard: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: carbonService.getDashboard,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-carbon-100 rounded w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-carbon-100 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-64 bg-carbon-100 rounded-xl" />
          <div className="h-64 bg-carbon-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const breakdown = stats.thisMonth.breakdown;
  const categoryBreakdown = Object.entries(breakdown).map(([category, co2Kg]) => ({
    category,
    co2Kg,
    percentage:
      stats.thisMonth.co2Kg > 0
        ? Math.round((co2Kg / stats.thisMonth.co2Kg) * 1000) / 10
        : 0,
  }));

  const worldMonthly = stats.globalComparison.world;
  const parisMonthly = stats.globalComparison.paris_target;
  const myMonthly = stats.thisMonth.co2Kg;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-carbon-900">
          Good day, {user?.username} 🌱
        </h1>
        <p className="text-carbon-500 mt-1">Here's your carbon footprint overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Today's Footprint"
          value={formatCO2(stats.today.co2Kg)}
          subtitle={`≈ ${stats.today.treeEquivalent.toFixed(2)} trees to offset`}
          icon={<Leaf className="h-5 w-5" />}
          color="green"
        />
        <StatsCard
          title="This Week"
          value={formatCO2(stats.thisWeek.co2Kg)}
          icon={<Zap className="h-5 w-5" />}
          color="blue"
        />
        <StatsCard
          title="This Month"
          value={formatCO2(stats.thisMonth.co2Kg)}
          subtitle={`≈ ${stats.thisMonth.treeEquivalent.toFixed(1)} trees`}
          icon={<Trees className="h-5 w-5" />}
          trend={stats.thisMonth.changePct}
          color="amber"
        />
        {stats.reductionFromBaseline !== null ? (
          <StatsCard
            title="Reduction from Baseline"
            value={`${stats.reductionFromBaseline.toFixed(1)}%`}
            subtitle="vs your personal baseline"
            icon={<TrendingDown className="h-5 w-5" />}
            color={stats.reductionFromBaseline > 0 ? 'green' : 'red'}
          />
        ) : (
          <StatsCard
            title="vs World Average"
            value={myMonthly > worldMonthly ? 'Above' : 'Below'}
            subtitle={`World: ${formatCO2(worldMonthly)}/mo`}
            icon={<Globe className="h-5 w-5" />}
            color={myMonthly <= worldMonthly ? 'green' : 'red'}
          />
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart data={stats.monthlyTrend} />
        <CategoryPieChart data={categoryBreakdown} />
      </div>

      {/* Category breakdown table + recent activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>This Month by Category</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {categoryBreakdown
              .sort((a, b) => b.co2Kg - a.co2Kg)
              .map(({ category, co2Kg, percentage }) => (
                <div key={category} className="flex items-center gap-3">
                  <span className="text-lg w-6 text-center">
                    {CATEGORY_ICONS[category as CarbonCategory]}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-carbon-700">
                        {CATEGORY_LABELS[category as CarbonCategory]}
                      </span>
                      <span className="text-sm text-carbon-500">{formatCO2(co2Kg)}</span>
                    </div>
                    <div className="h-1.5 bg-carbon-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-carbon-400 w-10 text-right">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              ))}
          </div>

          {/* Global comparison */}
          <div className="mt-5 pt-4 border-t border-carbon-100">
            <p className="text-xs font-medium text-carbon-500 mb-2">Global Comparison (monthly)</p>
            <div className="space-y-2">
              {[
                { label: 'Your footprint', value: myMonthly, color: 'bg-green-500' },
                { label: 'World average', value: worldMonthly, color: 'bg-blue-400' },
                { label: 'Paris target', value: parisMonthly, color: 'bg-amber-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="text-carbon-600 flex-1">{label}</span>
                  <span className="font-medium text-carbon-800">{formatCO2(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Recent activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          {stats.recentActivities.length === 0 ? (
            <div className="text-center py-8 text-carbon-400">
              <Leaf className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No activities yet.</p>
              <p className="text-sm">Start tracking to see your footprint!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentActivities.slice(0, 8).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2 border-b border-carbon-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {CATEGORY_ICONS[activity.category as CarbonCategory]}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-carbon-800 capitalize">
                        {activity.subcategory.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-carbon-400">
                        {formatRelativeDate(activity.date)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-carbon-700">
                    {formatCO2(activity.co2Kg)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
