import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { AIInsightsPanel } from '@/components/insights/AIInsights';
import { Button } from '@/components/ui/Button';
import { carbonService } from '@/services/carbon.service';

const Insights: React.FC = () => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['insights'],
    queryFn: carbonService.getInsights,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-carbon-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            AI Insights
          </h1>
          <p className="text-carbon-500 dark:text-carbon-400 mt-1 text-sm">
            Powered by Google Gemini — personalized recommendations for your footprint
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          isLoading={isFetching}
          leftIcon={<RefreshCw className="h-4 w-4" />}
          className="self-start sm:self-auto shrink-0"
        >
          Refresh
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-carbon-100 dark:bg-carbon-800 rounded-xl" />
          ))}
          <div className="text-center text-carbon-500 dark:text-carbon-400 text-sm flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 animate-pulse text-purple-500" />
            Gemini AI is analyzing your carbon data...
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl p-6 flex items-start gap-3
                        bg-red-50 border border-red-200
                        dark:bg-red-900/20 dark:border-red-800">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-400">Could not load insights</h3>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              You may have reached the hourly limit or there was a connection issue. Please try again later.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
              Try again
            </Button>
          </div>
        </div>
      )}

      {data && (
        <AIInsightsPanel
          insights={data.insights}
          totalMonthlyKg={data.dataSnapshot.totalMonthlyKg}
        />
      )}

      {!isLoading && !data && !error && (
        <div className="text-center py-16 text-carbon-400 dark:text-carbon-500">
          <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-carbon-600 dark:text-carbon-400">No insights available yet</p>
          <p className="text-sm mt-1">Log some activities first, then come back for personalized AI insights!</p>
        </div>
      )}
    </div>
  );
};

export default Insights;
