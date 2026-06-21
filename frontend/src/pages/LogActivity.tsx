import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Trash2, Car, Zap, Utensils, ShoppingBag, Recycle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ActivityLogger } from '@/components/carbon/ActivityLogger';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { carbonService } from '@/services/carbon.service';
import { formatCO2, formatRelativeDate } from '@/utils/formatters';
import { type CarbonCategory } from '@/types/carbon.types';
import { extractError } from '@/services/api';

const CATEGORY_ICON_MAP: Record<CarbonCategory, React.ElementType> = {
  transport: Car,
  energy:    Zap,
  food:      Utensils,
  shopping:  ShoppingBag,
  waste:     Recycle,
};

const CATEGORY_STYLE_MAP: Record<CarbonCategory, string> = {
  transport: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
  energy:    'text-amber-500 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20',
  food:      'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
  shopping:  'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20',
  waste:     'text-red-500 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
};

const LogActivity: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => carbonService.getActivities({ limit: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: carbonService.deleteActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Activity deleted');
    },
    onError: (error) => toast.error(extractError(error)),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-carbon-900 dark:text-white flex items-center gap-2">
          <Activity className="h-6 w-6 text-green-600" />
          Log Activity
        </h1>
        <p className="text-carbon-500 dark:text-carbon-400 mt-1">
          Track your daily activities and calculate their carbon impact
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ActivityLogger />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <p className="text-sm text-carbon-500 dark:text-carbon-400">Your last 20 logged activities</p>
          </CardHeader>

          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-carbon-50 dark:bg-carbon-700 rounded-lg" />
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-10 text-carbon-400 dark:text-carbon-500">
              <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No activities logged yet.</p>
              <p className="text-sm">Use the form to log your first activity!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data?.data.map((activity) => {
                const cat = activity.category as CarbonCategory;
                const CategoryIcon = CATEGORY_ICON_MAP[cat] ?? Activity;
                const styleClass   = CATEGORY_STYLE_MAP[cat] ?? 'text-carbon-400 bg-carbon-100 dark:bg-carbon-700';
                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 rounded-lg transition-colors group
                               bg-carbon-50 hover:bg-carbon-100
                               dark:bg-carbon-700/50 dark:hover:bg-carbon-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${styleClass}`}>
                        <CategoryIcon className="h-4 w-4" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-carbon-800 dark:text-carbon-200 capitalize">
                          {activity.subcategory.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-carbon-400 dark:text-carbon-500">
                          {activity.quantity} {activity.unit} · {formatRelativeDate(activity.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-carbon-700 dark:text-carbon-300">
                        {formatCO2(activity.co2Kg)}
                      </span>
                      <button
                        onClick={() => deleteMutation.mutate(activity.id)}
                        className="p-1.5 rounded transition-all
                                   text-carbon-300 hover:text-red-500 hover:bg-red-50
                                   sm:opacity-0 sm:group-hover:opacity-100
                                   dark:text-carbon-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                        title="Delete activity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default LogActivity;
