import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number | null;
  trendLabel?: string;
  color?: 'green' | 'blue' | 'amber' | 'red' | 'purple';
  className?: string;
}

const colorMap = {
  green:  'bg-green-100  text-green-600  dark:bg-green-900/40  dark:text-green-400',
  blue:   'bg-blue-100   text-blue-600   dark:bg-blue-900/40   dark:text-blue-400',
  amber:  'bg-amber-100  text-amber-600  dark:bg-amber-900/40  dark:text-amber-400',
  red:    'bg-red-100    text-red-600    dark:bg-red-900/40    dark:text-red-400',
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
};

const trendColorMap = {
  down:    'text-green-600 dark:text-green-400',
  up:      'text-red-500   dark:text-red-400',
  neutral: 'text-carbon-400 dark:text-carbon-500',
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title, value, subtitle, icon, trend, trendLabel, color = 'green', className,
}) => {
  const iconCls = colorMap[color];
  const trendDir = trend == null ? 'neutral' : trend < 0 ? 'down' : 'up';
  const TrendIcon = trend != null && trend < 0 ? TrendingDown : TrendingUp;

  return (
    <Card className={cn('animate-slide-up', className)}>
      {/* Icon + label row */}
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('p-1.5 rounded-lg shrink-0 [&_svg]:h-4 [&_svg]:w-4', iconCls)}>
          {icon}
        </div>
        <p className="text-xs font-medium text-carbon-500 dark:text-carbon-400 leading-tight truncate">
          {title}
        </p>
      </div>

      {/* Big value */}
      <p className="text-xl sm:text-2xl font-bold text-carbon-900 dark:text-white leading-none tracking-tight">
        {value}
      </p>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-carbon-400 dark:text-carbon-500 mt-1 leading-snug">
          {subtitle}
        </p>
      )}

      {/* Trend */}
      {trend != null && (
        <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', trendColorMap[trendDir])}>
          <TrendIcon className="h-3 w-3 shrink-0" />
          <span>{Math.abs(trend).toFixed(1)}% {trendLabel ?? 'vs last month'}</span>
        </div>
      )}
    </Card>
  );
};
