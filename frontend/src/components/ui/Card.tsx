import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variants = {
  default:  'bg-white dark:bg-carbon-800 shadow-sm dark:shadow-none',
  glass:    'bg-white/80 dark:bg-carbon-800/80 backdrop-blur-sm shadow-md dark:shadow-none',
  bordered: 'bg-white dark:bg-carbon-800 border border-carbon-200 dark:border-carbon-700',
};

const paddings = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

export const Card: React.FC<CardProps> = ({
  className, variant = 'default', padding = 'md', children, ...props
}) => (
  <div
    className={cn('rounded-xl transition-colors duration-200', variants[variant], paddings[padding], className)}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className, children, ...props
}) => (
  <div className={cn('mb-4', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className, children, ...props
}) => (
  <h3 className={cn('text-lg font-semibold text-carbon-900 dark:text-white', className)} {...props}>
    {children}
  </h3>
);
