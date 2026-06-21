import React from 'react';
import { Leaf, Zap, Trees, TrendingDown, Globe, Activity, Flame } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TrendChart, CategoryPieChart } from '@/components/carbon/FootprintChart';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import { formatCO2, formatRelativeDate } from '@/utils/formatters';
import { CATEGORY_LABELS, type CarbonCategory } from '@/types/carbon.types';
import { useDashboardStats, useStreak } from '@/hooks';
import { DAY_MS, CATEGORY_ICON_MAP, CATEGORY_STYLE_MAP } from '@/constants/carbon';

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const Dashboard: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { stats, isLoading } = useDashboardStats();
  const streakData = useStreak();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-carbon-100 dark:bg-carbon-800 rounded w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-carbon-100 dark:bg-carbon-800 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-64 bg-carbon-100 dark:bg-carbon-800 rounded-xl" />
          <div className="h-64 bg-carbon-100 dark:bg-carbon-800 rounded-xl" />
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
  const myMonthly    = stats.thisMonth.co2Kg;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-carbon-900 dark:text-white">
            Good day, {user?.username} 🌱
          </h1>
          <p className="text-carbon-500 dark:text-carbon-400 mt-1">Here's your carbon footprint overview</p>
        </div>

        {/* Streak banner */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border shrink-0
                        bg-amber-50 border-amber-200 dark:bg-amber-900/15 dark:border-amber-700/40">
          <div className="flex items-center gap-1.5">
            <Flame
              className={`h-5 w-5 ${streakData.streak > 0 ? 'text-amber-500' : 'text-carbon-300 dark:text-carbon-600'}`}
              aria-hidden="true"
            />
            <div>
              <p className={`text-sm font-bold leading-none ${streakData.streak > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-carbon-400 dark:text-carbon-500'}`}>
                {streakData.streak > 0 ? `Day ${streakData.streak}` : 'No streak'}
              </p>
              <p className="text-[10px] text-carbon-400 dark:text-carbon-500 mt-0.5 leading-none">
                {streakData.loggedToday ? 'Logged today ✓' : 'Log today to continue'}
              </p>
            </div>
          </div>
          <div className="flex items-end gap-1" aria-label="Last 7 days activity">
            {streakData.dots.map((active, i) => {
              const dayDate = new Date(Date.now() - (6 - i) * DAY_MS);
              const isToday = i === 6;
              return (
                <div key={`dot-${i}`} className="flex flex-col items-center gap-0.5">
                  <div className={`rounded-full transition-all duration-300 ${
                    active
                      ? isToday
                        ? 'w-3 h-3 bg-amber-500 ring-2 ring-amber-300 dark:ring-amber-600'
                        : 'w-2.5 h-2.5 bg-amber-400 dark:bg-amber-500'
                      : isToday
                        ? 'w-3 h-3 bg-carbon-200 dark:bg-carbon-700 ring-2 ring-carbon-300 dark:ring-carbon-600'
                        : 'w-2.5 h-2.5 bg-carbon-200 dark:bg-carbon-700'
                  }`} />
                  <span className="text-[9px] text-carbon-400 dark:text-carbon-500">
                    {DAY_LABELS[dayDate.getDay()]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Today"
          value={formatCO2(stats.today.co2Kg)}
          subtitle={`≈ ${stats.today.treeEquivalent.toFixed(1)} trees`}
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
            title="Reduction"
            value={`${stats.reductionFromBaseline.toFixed(1)}%`}
            subtitle="vs your baseline"
            icon={<TrendingDown className="h-5 w-5" />}
            color={stats.reductionFromBaseline > 0 ? 'green' : 'red'}
          />
        ) : (
          <StatsCard
            title="vs World Avg"
            value={myMonthly > worldMonthly ? 'Above' : 'Below'}
            subtitle={`World: ${Math.round(worldMonthly)} kg/mo`}
            icon={<Globe className="h-5 w-5" />}
            color={myMonthly <= worldMonthly ? 'green' : 'red'}
          />
        )}
      </div>

      {/* Reduction Goal Progress */}
      {stats.reductionFromBaseline !== null && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-green-600" aria-hidden="true" />
                <CardTitle>Reduction Goal Progress</CardTitle>
              </div>
              <span className="text-sm text-carbon-500 dark:text-carbon-400">Target: 20% reduction from baseline</span>
            </div>
          </CardHeader>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-carbon-600 dark:text-carbon-400">
                Achieved: <strong>{Math.max(0, stats.reductionFromBaseline).toFixed(1)}%</strong>
              </span>
              <span className={`font-semibold ${stats.reductionFromBaseline >= 20 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {stats.reductionFromBaseline >= 20
                  ? 'Goal reached!'
                  : `${(20 - Math.max(0, stats.reductionFromBaseline)).toFixed(1)}% remaining`}
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={Math.min(Math.max(0, stats.reductionFromBaseline), 20)}
              aria-valuemin={0}
              aria-valuemax={20}
              aria-label={`Reduction goal: ${stats.reductionFromBaseline.toFixed(1)}% of 20% target achieved`}
              className="h-2.5 bg-carbon-100 dark:bg-carbon-700 rounded-full overflow-hidden"
            >
              <div
                className={`h-full rounded-full transition-all duration-700 ${stats.reductionFromBaseline >= 20 ? 'bg-green-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(Math.max(0, (stats.reductionFromBaseline / 20) * 100), 100)}%` }}
              />
            </div>
            <p className="text-xs text-carbon-400 dark:text-carbon-500">
              Compared to your personal baseline · Update your reduction target in{' '}
              <a href="/profile" className="text-green-600 dark:text-green-400 hover:underline">Profile settings</a>
            </p>
          </div>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart data={stats.monthlyTrend} />
        <CategoryPieChart data={categoryBreakdown} />
      </div>

      {/* Category breakdown + recent activities */}
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
                  <div className={`p-1.5 rounded-lg ${CATEGORY_STYLE_MAP[category as CarbonCategory] ?? 'text-carbon-400 bg-carbon-100'}`}>
                    {React.createElement(CATEGORY_ICON_MAP[category as CarbonCategory] ?? Activity, { className: 'h-3.5 w-3.5', strokeWidth: 1.5 })}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-carbon-700 dark:text-carbon-300">
                        {CATEGORY_LABELS[category as CarbonCategory]}
                      </span>
                      <span className="text-sm text-carbon-500 dark:text-carbon-400">{formatCO2(co2Kg)}</span>
                    </div>
                    <div className="h-1.5 bg-carbon-100 dark:bg-carbon-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-carbon-400 dark:text-carbon-500 w-10 text-right">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              ))}
          </div>

          {/* Global comparison */}
          <div className="mt-5 pt-4 border-t border-carbon-100 dark:border-carbon-700">
            <p className="text-xs font-medium text-carbon-500 dark:text-carbon-400 mb-2">
              Global Comparison (monthly)
            </p>
            <div className="space-y-2">
              {[
                { label: 'Your footprint', value: myMonthly,    color: 'bg-green-500' },
                { label: 'World average',  value: worldMonthly, color: 'bg-blue-400'  },
                { label: 'Paris target',   value: parisMonthly, color: 'bg-amber-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="text-carbon-600 dark:text-carbon-400 flex-1">{label}</span>
                  <span className="font-medium text-carbon-800 dark:text-carbon-200">{formatCO2(value)}</span>
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
            <div className="text-center py-8 text-carbon-400 dark:text-carbon-500">
              <Leaf className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No activities yet.</p>
              <p className="text-sm">Start tracking to see your footprint!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentActivities.slice(0, 8).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2 border-b border-carbon-50 dark:border-carbon-700 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${CATEGORY_STYLE_MAP[activity.category as CarbonCategory] ?? 'text-carbon-400 bg-carbon-100'}`}>
                      {React.createElement(CATEGORY_ICON_MAP[activity.category as CarbonCategory] ?? Activity, { className: 'h-4 w-4', strokeWidth: 1.5 })}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-carbon-800 dark:text-carbon-200 capitalize">
                        {activity.subcategory.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-carbon-400 dark:text-carbon-500">
                        {formatRelativeDate(activity.date)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-carbon-700 dark:text-carbon-300">
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
