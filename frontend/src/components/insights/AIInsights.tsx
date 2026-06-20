import React from 'react';
import {
  Sparkles,
  TrendingDown,
  Target,
  Zap,
  AlertCircle,
  Globe2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/utils/cn';
import { getDifficultyColor, getPriorityColor } from '@/utils/formatters';
import type { AIInsights as AIInsightsType } from '@/types/carbon.types';

interface AIInsightsPanelProps {
  insights: AIInsightsType;
  totalMonthlyKg: number;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  insights,
  totalMonthlyKg,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary */}
      <Card className="border-l-4 border-l-green-500">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-green-100 rounded-lg shrink-0">
            <Sparkles className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-carbon-900 mb-1">Your Carbon Summary</h3>
            <p className="text-carbon-600 text-sm leading-relaxed">{insights.summary}</p>
            <p className="text-carbon-500 text-xs mt-2 italic">{insights.comparisonToAverage}</p>
          </div>
        </div>
      </Card>

      {/* Motivational message */}
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
            <span
              key={i}
              className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm font-medium capitalize border border-orange-100"
            >
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
          <p className="text-sm text-carbon-500">AI-powered tips based on your footprint</p>
        </CardHeader>
        <div className="space-y-3">
          {insights.personalizedTips.map((tip, i) => (
            <div
              key={i}
              className={cn(
                'p-4 rounded-lg border border-carbon-100 border-l-4',
                getPriorityColor(tip.priority)
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-carbon-500 capitalize bg-carbon-100 px-2 py-0.5 rounded">
                      {tip.category}
                    </span>
                    <span
                      className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded capitalize',
                        getDifficultyColor(tip.difficulty)
                      )}
                    >
                      {tip.difficulty}
                    </span>
                    {tip.priority === 'high' && (
                      <span className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        High priority
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-carbon-700">{tip.tip}</p>
                </div>
                {tip.potentialSavingKg > 0 && (
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-bold text-green-600">
                      -{tip.potentialSavingKg.toFixed(1)} kg
                    </div>
                    <div className="text-xs text-carbon-400">CO₂e/month</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Challenge */}
      <Card className="bg-gradient-to-br from-carbon-900 to-carbon-800 text-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-green-400" />
            <CardTitle className="text-white">This Week's Challenge</CardTitle>
          </div>
        </CardHeader>
        <h4 className="text-lg font-bold text-green-400 mb-2">
          {insights.weeklyChallenge.title}
        </h4>
        <p className="text-carbon-300 text-sm leading-relaxed mb-4">
          {insights.weeklyChallenge.description}
        </p>
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
