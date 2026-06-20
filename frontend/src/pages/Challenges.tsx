import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, CheckCircle2, Clock, Leaf, Zap, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { carbonService } from '@/services/carbon.service';
import { getDifficultyColor } from '@/utils/formatters';
import { extractError } from '@/services/api';
import type { Challenge } from '@/types/carbon.types';

const DIFFICULTY_STARS: Record<string, string> = {
  easy: '⭐',
  medium: '⭐⭐',
  hard: '⭐⭐⭐',
};

const Challenges: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: carbonService.getChallenges,
  });

  const { data: userChallenges = [] } = useQuery({
    queryKey: ['userChallenges'],
    queryFn: carbonService.getUserChallenges,
  });

  const joinMutation = useMutation({
    mutationFn: carbonService.joinChallenge,
    onSuccess: (_, challengeId) => {
      queryClient.invalidateQueries({ queryKey: ['userChallenges'] });
      toast.success('Challenge joined! Good luck! 🌱');
    },
    onError: (error) => toast.error(extractError(error)),
  });

  const activeIds = new Set(
    userChallenges.filter((uc) => uc.status === 'active').map((uc) => uc.challengeId)
  );

  const completedIds = new Set(
    userChallenges.filter((uc) => uc.status === 'completed').map((uc) => uc.challengeId)
  );

  const grouped = challenges.reduce<Record<string, Challenge[]>>((acc, c) => {
    (acc[c.category] = acc[c.category] || []).push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-carbon-900 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          Challenges
        </h1>
        <p className="text-carbon-500 mt-1">
          Take on carbon reduction challenges and earn points
        </p>
      </div>

      {/* My active challenges */}
      {userChallenges.filter((uc) => uc.status === 'active').length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-carbon-800 mb-3">My Active Challenges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userChallenges
              .filter((uc) => uc.status === 'active')
              .map((uc) => (
                <Card key={uc.id} className="border-l-4 border-l-green-500">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-carbon-900">{uc.challenge.title}</p>
                      <p className="text-sm text-carbon-500 mt-0.5">
                        <Clock className="h-3.5 w-3.5 inline mr-1" />
                        {uc.challenge.durationDays} days · Started{' '}
                        {new Date(uc.startedAt).toLocaleDateString()}
                      </p>
                      <div className="mt-2 h-1.5 bg-carbon-100 rounded-full">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${uc.progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Available challenges by category */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-carbon-100 rounded-xl" />
          ))}
        </div>
      ) : (
        Object.entries(grouped).map(([category, catChallenges]) => (
          <div key={category}>
            <h2 className="text-lg font-semibold text-carbon-800 mb-3 capitalize">
              {category} Challenges
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {catChallenges.map((challenge) => {
                const isActive = activeIds.has(challenge.id);
                const isCompleted = completedIds.has(challenge.id);

                return (
                  <Card
                    key={challenge.id}
                    className={`transition-all ${isCompleted ? 'opacity-60' : ''}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-base">{challenge.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded capitalize ${getDifficultyColor(
                                challenge.difficulty as any
                              )}`}
                            >
                              {DIFFICULTY_STARS[challenge.difficulty]} {challenge.difficulty}
                            </span>
                            <span className="text-xs text-carbon-400">
                              {challenge.durationDays} days
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold text-green-600">
                            -{challenge.co2Savings.toFixed(0)} kg
                          </div>
                          <div className="text-xs text-carbon-400">CO₂e saved</div>
                        </div>
                      </div>
                    </CardHeader>

                    <p className="text-sm text-carbon-600 mb-3 leading-relaxed">
                      {challenge.description}
                    </p>

                    {(challenge.tips as string[]).slice(0, 2).map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 mb-1">
                        <Leaf className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-carbon-500">{tip}</p>
                      </div>
                    ))}

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-carbon-100">
                      <div className="flex items-center gap-1 text-amber-600">
                        <Zap className="h-4 w-4" />
                        <span className="text-sm font-medium">{challenge.points} pts</span>
                      </div>

                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          Completed!
                        </span>
                      ) : isActive ? (
                        <span className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                          <Clock className="h-4 w-4" />
                          In progress
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => joinMutation.mutate(challenge.id)}
                          isLoading={joinMutation.isPending && joinMutation.variables === challenge.id}
                        >
                          Join Challenge
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Challenges;
