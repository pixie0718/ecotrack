import React from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
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
  green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', text: 'text-green-600' },
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', text: 'text-blue-600' },
  amber: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', text: 'text-amber-600' },
  red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', text: 'text-red-600' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', text: 'text-purple-600' },
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  color = 'green',
  className,
}) => {
  const colors = colorMap[color];

  const TrendIcon =
    trend === null || trend === undefined
      ? Minus
      : trend < 0
      ? TrendingDown
      : TrendingUp;

  const trendColor =
    trend === null || trend === undefined
      ? 'text-carbon-400'
      : trend < 0
      ? 'text-green-600'  // decrease = good for carbon
      : 'text-red-500';

  return (
    <Card className={cn('animate-slide-up', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-carbon-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-carbon-900">{value}</p>
          {subtitle && <p className="text-sm text-carbon-500 mt-1">{subtitle}</p>}
        </div>
        <div className={cn('p-3 rounded-xl', colors.icon)}>{icon}</div>
      </div>

      {trend !== undefined && trend !== null && (
        <div className={cn('flex items-center gap-1 mt-3 text-xs font-medium', trendColor)}>
          <TrendIcon className="h-3.5 w-3.5" />
          <span>
            {Math.abs(trend).toFixed(1)}% {trendLabel ?? 'vs last month'}
          </span>
        </div>
      )}
    </Card>
  );
};
