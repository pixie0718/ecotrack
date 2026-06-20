import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { carbonService } from '@/services/carbon.service';
import {
  SUBCATEGORY_OPTIONS,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  type CarbonCategory,
} from '@/types/carbon.types';
import { formatCO2 } from '@/utils/formatters';
import { extractError } from '@/services/api';

const schema = z.object({
  category: z.enum(['transport', 'energy', 'food', 'shopping', 'waste']),
  subcategory: z.string().min(1),
  quantity: z.number({ coerce: true }).positive('Must be positive'),
  description: z.string().optional(),
  date: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const CATEGORIES: Array<{ value: CarbonCategory; label: string }> = [
  { value: 'transport', label: `${CATEGORY_ICONS.transport} Transport` },
  { value: 'energy', label: `${CATEGORY_ICONS.energy} Energy` },
  { value: 'food', label: `${CATEGORY_ICONS.food} Food` },
  { value: 'shopping', label: `${CATEGORY_ICONS.shopping} Shopping` },
  { value: 'waste', label: `${CATEGORY_ICONS.waste} Waste` },
];

export const ActivityLogger: React.FC = () => {
  const queryClient = useQueryClient();
  const [lastLogged, setLastLogged] = useState<{ co2Kg: number; treeEquivalent: number } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'transport', subcategory: '' },
  });

  const selectedCategory = watch('category') as CarbonCategory;
  const subcategoryOptions = SUBCATEGORY_OPTIONS[selectedCategory] ?? [];
  const selectedSubcategory = watch('subcategory');
  const unit = subcategoryOptions.find((o) => o.value === selectedSubcategory)?.unit ?? '';

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      carbonService.logActivity({
        category: data.category,
        subcategory: data.subcategory,
        quantity: data.quantity,
        unit,
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
    onError: (error) => {
      toast.error(extractError(error));
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-green-600" />
          <CardTitle>Log Carbon Activity</CardTitle>
        </div>
        <p className="text-sm text-carbon-500">Track your daily activities to calculate your footprint</p>
      </CardHeader>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
            error={errors.category?.message}
            required
            {...register('category')}
          />
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={`Quantity ${unit ? `(${unit})` : ''}`}
            type="number"
            step="0.01"
            min="0"
            placeholder="0"
            error={errors.quantity?.message}
            required
            {...register('quantity', { valueAsNumber: true })}
          />
          <Input
            label="Date (optional)"
            type="date"
            max={new Date().toISOString().split('T')[0]}
            {...register('date')}
          />
        </div>

        <Input
          label="Description (optional)"
          placeholder="e.g. Drive to office"
          {...register('description')}
        />

        <Button type="submit" isLoading={mutation.isPending} className="w-full">
          <PlusCircle className="h-4 w-4" />
          Log Activity
        </Button>
      </form>

      {lastLogged && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 animate-fade-in">
          <div className="flex items-center gap-2 text-green-700">
            <Leaf className="h-4 w-4" />
            <span className="text-sm font-medium">Activity logged successfully!</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            <strong>{formatCO2(lastLogged.co2Kg)}</strong> CO₂e ≈{' '}
            <strong>{lastLogged.treeEquivalent.toFixed(2)} trees</strong> needed to offset
          </p>
        </div>
      )}
    </Card>
  );
};
