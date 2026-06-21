import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Leaf, Car, Zap, Utensils, ShoppingBag, Recycle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { carbonService } from '@/services/carbon.service';
import { SUBCATEGORY_OPTIONS, type CarbonCategory } from '@/types/carbon.types';
import { formatCO2 } from '@/utils/formatters';
import { extractError } from '@/services/api';

const schema = z.object({
  category:    z.enum(['transport', 'energy', 'food', 'shopping', 'waste']),
  subcategory: z.string().min(1),
  quantity:    z.number({ coerce: true }).positive('Must be positive'),
  description: z.string().optional(),
  date:        z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const CATEGORY_OPTIONS: Array<{
  value: CarbonCategory;
  label: string;
  Icon: React.ElementType;
  activeColor: string;
  iconColor: string;
}> = [
  { value: 'transport', label: 'Transport', Icon: Car,         activeColor: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',    iconColor: 'text-blue-600 dark:text-blue-400' },
  { value: 'energy',    label: 'Energy',    Icon: Zap,         activeColor: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-500 dark:text-amber-400' },
  { value: 'food',      label: 'Food',      Icon: Utensils,    activeColor: 'border-green-500 bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600 dark:text-green-400' },
  { value: 'shopping',  label: 'Shopping',  Icon: ShoppingBag, activeColor: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600 dark:text-purple-400' },
  { value: 'waste',     label: 'Waste',     Icon: Recycle,     activeColor: 'border-red-400 bg-red-50 dark:bg-red-900/20',      iconColor: 'text-red-500 dark:text-red-400' },
];

export const ActivityLogger: React.FC = () => {
  const queryClient = useQueryClient();
  const [lastLogged, setLastLogged] = useState<{ co2Kg: number; treeEquivalent: number } | null>(null);

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'transport', subcategory: '' },
  });

  const selectedCategory    = watch('category') as CarbonCategory;
  const subcategoryOptions  = SUBCATEGORY_OPTIONS[selectedCategory] ?? [];
  const selectedSubcategory = watch('subcategory');
  const unit = subcategoryOptions.find((o) => o.value === selectedSubcategory)?.unit ?? '';

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      carbonService.logActivity({
        category: data.category, subcategory: data.subcategory,
        quantity: data.quantity, unit,
        description: data.description,
        date: data.date ? new Date(data.date).toISOString() : undefined,
      }),
    onSuccess: (activity) => {
      setLastLogged({ co2Kg: activity.co2Kg, treeEquivalent: activity.treeEquivalent ?? 0 });
      toast.success(`Activity logged: ${formatCO2(activity.co2Kg)} CO₂e`);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      reset({ category: selectedCategory, subcategory: '' });
    },
    onError: (error) => toast.error(extractError(error)),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-green-600" />
          <CardTitle>Log Carbon Activity</CardTitle>
        </div>
        <p className="text-sm text-carbon-500 dark:text-carbon-400">
          Track your daily activities to calculate your footprint
        </p>
      </CardHeader>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
        {/* Category icon-button picker */}
        <div>
          <p className="block text-sm font-medium mb-2 text-carbon-700 dark:text-carbon-300">
            Category <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {CATEGORY_OPTIONS.map(({ value, label, Icon, activeColor, iconColor }) => {
              const isActive = selectedCategory === value;
              return (
                <button
                  key={value}
                  type="button"
                  title={label}
                  onClick={() => {
                    setValue('category', value, { shouldValidate: true });
                    setValue('subcategory', '');
                  }}
                  className={`flex flex-col items-center gap-1 py-2.5 sm:py-3 px-1 rounded-xl border-2 transition-all duration-150
                    ${isActive
                      ? activeColor
                      : 'border-carbon-200 dark:border-carbon-700 hover:border-carbon-300 dark:hover:border-carbon-600 bg-transparent'
                    }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors ${isActive ? iconColor : 'text-carbon-400 dark:text-carbon-500'}`}
                    strokeWidth={1.5}
                  />
                  <span className={`hidden sm:block text-xs font-medium leading-none transition-colors
                    ${isActive ? 'text-carbon-800 dark:text-carbon-100' : 'text-carbon-400 dark:text-carbon-500'}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.category && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.category.message}</p>
          )}
        </div>

        {/* Activity dropdown + quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Activity"
            options={[
              { value: '', label: 'Select activity...' },
              ...subcategoryOptions.map((o) => ({ value: o.value, label: o.label })),
            ]}
            error={errors.subcategory?.message}
            required
            {...register('subcategory')}
          />
          <Input
            label={`Quantity${unit ? ` (${unit})` : ''}`}
            type="number" step="0.01" min="0" placeholder="0"
            error={errors.quantity?.message}
            required
            {...register('quantity', { valueAsNumber: true })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Description (optional)"
            placeholder="e.g. Drive to office"
            {...register('description')}
          />
          <Input
            label="Date (optional)"
            type="date"
            max={new Date().toISOString().split('T')[0]}
            {...register('date')}
          />
        </div>

        <Button type="submit" isLoading={mutation.isPending} className="w-full">
          <PlusCircle className="h-4 w-4" />
          Log Activity
        </Button>
      </form>

      {lastLogged && (
        <div className="mt-5 p-4 rounded-xl border animate-fade-in
                        bg-green-50 border-green-200
                        dark:bg-green-900/20 dark:border-green-800">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <Leaf className="h-4 w-4" />
            <span className="text-sm font-semibold">Activity logged successfully!</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            <strong>{formatCO2(lastLogged.co2Kg)}</strong> CO₂e ≈{' '}
            <strong>{lastLogged.treeEquivalent.toFixed(2)} trees</strong> needed to offset
          </p>
        </div>
      )}
    </Card>
  );
};
