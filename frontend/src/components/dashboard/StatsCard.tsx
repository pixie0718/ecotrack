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
  green:  { icon: 'bg-green-100  text-green-600  dark:bg-green-900/40  dark:text-green-400'  },
  blue:   { icon: 'bg-blue-100   text-blue-600   dark:bg-blue-900/40   dark:text-blue-400'   },
  amber:  { icon: 'bg-amber-100  text-amber-600  dark:bg-amber-900/40  dark:text-amber-400'  },
  red:    { icon: 'bg-red-100    text-red-600    dark:bg-red-900/40    dark:text-red-400'    },
  purple: { icon: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' },
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title, value, subtitle, icon, trend, trendLabel, color = 'green', className,
}) => {
  const colors = colorMap[color];

  const TrendIcon =
    trend == null ? Minus : trend < 0 ? TrendingDown : TrendingUp;

  const trendColor =
    trend == null
      ? 'text-carbon-400 dark:text-carbon-500'
      : trend < 0
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-500 dark:text-red-400';

  return (
    <Card className={cn('animate-slide-up', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-carbon-500 dark:text-carbon-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-carbon-900 dark:text-white">{value}</p>
          {subtitle && <p className="text-sm text-carbon-500 dark:text-carbon-400 mt-1">{subtitle}</p>}
        </div>
        <div className={cn('p-3 rounded-xl', colors.icon)}>{icon}</div>
      </div>

      {trend != null && (
        <div className={cn('flex items-center gap-1 mt-3 text-xs font-medium', trendColor)}>
          <TrendIcon className="h-3.5 w-3.5" />
          <span>{Math.abs(trend).toFixed(1)}% {trendLabel ?? 'vs last month'}</span>
        </div>
      )}
    </Card>
  );
};
