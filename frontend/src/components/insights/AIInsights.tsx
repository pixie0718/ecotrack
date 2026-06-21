import React from 'react';
import { Sparkles, TrendingDown, Target, Zap, AlertCircle, Globe2 } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/utils/cn';
import { getDifficultyColor, getPriorityColor } from '@/utils/formatters';
import type { AIInsights as AIInsightsType } from '@/types/carbon.types';

interface AIInsightsPanelProps {
  insights: AIInsightsType;
  totalMonthlyKg: number;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ insights, totalMonthlyKg }) => {
  // Paris target is ~167 kg/month (2,000 kg/year ÷ 12)
  const parisMonthly = 167;
  const pctOfParis   = totalMonthlyKg > 0 ? Math.round((totalMonthlyKg / parisMonthly) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Summary */}
      <Card className="border-l-4 border-l-green-500">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg shrink-0">
            <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-carbon-900 dark:text-white mb-1">Your Carbon Summary</h3>
            <p className="text-carbon-600 dark:text-carbon-400 text-sm leading-relaxed">{insights.summary}</p>
            <p className="text-carbon-500 dark:text-carbon-500 text-xs mt-2 italic">{insights.comparisonToAverage}</p>
            {totalMonthlyKg > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <div
                  className="flex-1 h-1.5 bg-carbon-100 dark:bg-carbon-700 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={Math.min(pctOfParis, 200)}
                  aria-valuemin={0}
                  aria-valuemax={200}
                  aria-label={`You are at ${pctOfParis}% of the Paris climate target`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${pctOfParis <= 100 ? 'bg-green-500' : pctOfParis <= 150 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(pctOfParis / 2, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-carbon-500 dark:text-carbon-400 whitespace-nowrap">
                  {pctOfParis}% of Paris target
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Motivational */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl p-5 text-white">
        <p className="font-medium text-lg">💚 {insights.motivationalMessage}</p>
      </div>

      {/* Top Impact Areas */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            <CardTitle>Your Top Impact Areas</CardTitle>
          </div>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          {insights.topImpactAreas.map((area, i) => (
            <span key={i}
              className="px-3 py-1.5 rounded-full text-sm font-medium capitalize
                         bg-orange-50 text-orange-700 border border-orange-100
                         dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">
              {area}
            </span>
          ))}
        </div>
      </Card>

      {/* Personalized Tips */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            <CardTitle>Personalized Recommendations</CardTitle>
          </div>
          <p className="text-sm text-carbon-500 dark:text-carbon-400">AI-powered tips based on your footprint</p>
        </CardHeader>
        <div className="space-y-3">
          {insights.personalizedTips.map((tip, i) => (
            <div key={i} className={cn('p-4 rounded-lg border border-l-4', getPriorityColor(tip.priority))}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium capitalize px-2 py-0.5 rounded
                                     text-carbon-500 bg-carbon-100
                                     dark:text-carbon-400 dark:bg-carbon-700">
                      {tip.category}
                    </span>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded capitalize', getDifficultyColor(tip.difficulty))}>
                      {tip.difficulty}
                    </span>
                    {tip.priority === 'high' && (
                      <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                        <AlertCircle className="h-3 w-3" />
                        High priority
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-carbon-700 dark:text-carbon-300">{tip.tip}</p>
                </div>
                {tip.potentialSavingKg > 0 && (
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-bold text-green-600 dark:text-green-400">
                      -{tip.potentialSavingKg.toFixed(1)} kg
                    </div>
                    <div className="text-xs text-carbon-400 dark:text-carbon-500">CO₂e/month</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Challenge — already dark themed (carbon-900 bg) */}
      <Card className="bg-gradient-to-br from-carbon-900 to-carbon-800 text-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-green-400" />
            <CardTitle className="text-white">This Week's Challenge</CardTitle>
          </div>
        </CardHeader>
        <h4 className="text-lg font-bold text-green-400 mb-2">{insights.weeklyChallenge.title}</h4>
        <p className="text-carbon-300 text-sm leading-relaxed mb-4">{insights.weeklyChallenge.description}</p>
        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-3">
          <Globe2 className="h-5 w-5 text-green-400 shrink-0" />
          <span className="text-sm text-green-300">
            Estimated saving:{' '}
            <strong className="text-green-400">
              {insights.weeklyChallenge.estimatedSaving.toFixed(1)} kg CO₂e
            </strong>{' '}
            this week
          </span>
        </div>
      </Card>
    </div>
  );
};
