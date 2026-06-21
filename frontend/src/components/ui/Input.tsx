import React from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftElement, rightElement, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium mb-1.5 text-carbon-700 dark:text-carbon-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftElement && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-carbon-400 dark:text-carbon-500">
              {leftElement}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'block w-full rounded-lg border text-sm py-2.5 transition-colors duration-150',
              'text-carbon-900 placeholder-carbon-400 bg-white',
              'dark:bg-carbon-800 dark:text-carbon-100 dark:placeholder-carbon-500',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              leftElement  ? 'pl-10 pr-3' : 'px-3',
              rightElement ? 'pr-10'      : '',
              error
                ? 'border-red-400 focus:border-red-400 focus:ring-red-300 dark:border-red-500'
                : 'border-carbon-300 focus:border-green-500 focus:ring-green-200 dark:border-carbon-600 dark:focus:border-green-500 dark:focus:ring-green-800',
              'disabled:bg-carbon-50 dark:disabled:bg-carbon-900 disabled:text-carbon-400 disabled:cursor-not-allowed',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-carbon-500 dark:text-carbon-400">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium mb-1.5 text-carbon-700 dark:text-carbon-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'block w-full rounded-lg border text-sm py-2.5 px-3 transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'bg-white text-carbon-900 dark:bg-carbon-800 dark:text-carbon-100',
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-300 dark:border-red-500'
              : 'border-carbon-300 focus:border-green-500 focus:ring-green-200 dark:border-carbon-600 dark:focus:border-green-500',
            className
          )}
          aria-invalid={!!error}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
