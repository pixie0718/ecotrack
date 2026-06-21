import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Trophy, CheckCircle2, Clock, Leaf, Zap, Star,
  Flame, Wind, ShoppingBag, Trash2, Car, ArrowRight,
  Award, Target, TrendingDown, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { carbonService } from '@/services/carbon.service';
import { extractError } from '@/services/api';
import type { Challenge } from '@/types/carbon.types';

/* ─── Category config ─────────────────────────────────────────── */
const CATEGORY_CONFIG: Record<string, {
  icon: React.JSX.Element; gradient: string; lightBg: string; darkBg: string; accent: string;
}> = {
  transport: {
    icon: <Car className="h-5 w-5" />,
    gradient: 'from-blue-500 to-cyan-400',
    lightBg: 'bg-blue-50 border-blue-200',
    darkBg: 'dark:bg-blue-900/20 dark:border-blue-800',
    accent: 'text-blue-600 dark:text-blue-400',
  },
  energy: {
    icon: <Zap className="h-5 w-5" />,
    gradient: 'from-amber-500 to-yellow-400',
    lightBg: 'bg-amber-50 border-amber-200',
    darkBg: 'dark:bg-amber-900/20 dark:border-amber-800',
    accent: 'text-amber-600 dark:text-amber-400',
  },
  food: {
    icon: <Leaf className="h-5 w-5" />,
    gradient: 'from-green-500 to-emerald-400',
    lightBg: 'bg-green-50 border-green-200',
    darkBg: 'dark:bg-green-900/20 dark:border-green-800',
    accent: 'text-green-600 dark:text-green-400',
  },
  shopping: {
    icon: <ShoppingBag className="h-5 w-5" />,
    gradient: 'from-purple-500 to-violet-400',
    lightBg: 'bg-purple-50 border-purple-200',
    darkBg: 'dark:bg-purple-900/20 dark:border-purple-800',
    accent: 'text-purple-600 dark:text-purple-400',
  },
  waste: {
    icon: <Trash2 className="h-5 w-5" />,
    gradient: 'from-orange-500 to-red-400',
    lightBg: 'bg-orange-50 border-orange-200',
    darkBg: 'dark:bg-orange-900/20 dark:border-orange-800',
    accent: 'text-orange-600 dark:text-orange-400',
  },
};

const DEFAULT_CAT = {
  icon: <Wind className="h-5 w-5" />,
  gradient: 'from-teal-500 to-green-400',
  lightBg: 'bg-teal-50 border-teal-200',
  darkBg: 'dark:bg-teal-900/20 dark:border-teal-800',
  accent: 'text-teal-600 dark:text-teal-400',
};

/* ─── Difficulty config ───────────────────────────────────────── */
const DIFF_CONFIG = {
  easy:   { label: 'Easy',   stars: 1, ring: 'ring-green-400',  text: 'text-green-600 dark:text-green-400',  bg: 'bg-green-100 dark:bg-green-900/30' },
  medium: { label: 'Medium', stars: 2, ring: 'ring-amber-400',  text: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-100 dark:bg-amber-900/30' },
  hard:   { label: 'Hard',   stars: 3, ring: 'ring-red-400',    text: 'text-red-600 dark:text-red-400',      bg: 'bg-red-100 dark:bg-red-900/30' },
};

function DiffBadge({ difficulty }: { difficulty: string }) {
  const cfg = DIFF_CONFIG[difficulty as keyof typeof DIFF_CONFIG] ?? DIFF_CONFIG.easy;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.text} ${cfg.bg}`}>
      {Array.from({ length: cfg.stars }).map((_, i) => (
        <Star key={i} className="h-3 w-3 fill-current" />
      ))}
      {cfg.label}
    </span>
  );
}

/* ─── Challenge Card ──────────────────────────────────────────── */
interface ChallengeCardProps {
  challenge: Challenge;
  isActive: boolean;
  isCompleted: boolean;
  onJoin: (id: string) => void;
  isJoining: boolean;
  catConfig: typeof DEFAULT_CAT;
}

function ChallengeCard({ challenge, isActive, isCompleted, onJoin, isJoining, catConfig }: ChallengeCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative rounded-2xl border overflow-hidden
        transition-all duration-300 cursor-default
        ${isCompleted ? 'opacity-70' : ''}
        ${hovered && !isCompleted ? 'shadow-xl -translate-y-1' : 'shadow-md'}
        bg-white dark:bg-carbon-800
        border-carbon-100 dark:border-carbon-700
      `}
    >
      {/* Top gradient strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${catConfig.gradient}`} />

      {/* Completed overlay badge */}
      {isCompleted && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5
                        bg-green-500 text-white text-xs font-bold rounded-full shadow-lg z-10">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Completed
        </div>
      )}

      {/* Active badge */}
      {isActive && !isCompleted && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5
                        bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg z-10 animate-pulse">
          <Flame className="h-3.5 w-3.5" />
          Active
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${catConfig.gradient} text-white shadow-md shrink-0`}>
            {catConfig.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-carbon-900 dark:text-white leading-tight text-base pr-16">
              {challenge.title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <DiffBadge difficulty={challenge.difficulty} />
              <span className="text-xs text-carbon-400 dark:text-carbon-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {challenge.durationDays}d
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-carbon-600 dark:text-carbon-400 leading-relaxed mb-4">
          {challenge.description}
        </p>

        {/* Tips */}
        {(challenge.tips as string[]).slice(0, 2).map((tip, i) => (
          <div key={i} className="flex items-start gap-2 mb-1.5">
            <ArrowRight className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${catConfig.accent}`} />
            <p className="text-xs text-carbon-500 dark:text-carbon-400 leading-relaxed">{tip}</p>
          </div>
        ))}

        {/* Stats row */}
        <div className={`
          mt-4 pt-4 border-t border-carbon-100 dark:border-carbon-700
          flex items-center justify-between
        `}>
          <div className="flex items-center gap-4">
            {/* CO2 saving */}
            <div>
              <div className={`text-lg font-extrabold ${catConfig.accent}`}>
                -{challenge.co2Savings.toFixed(0)} kg
              </div>
              <div className="text-xs text-carbon-400 dark:text-carbon-500">CO₂e saved</div>
            </div>
            {/* Points */}
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {challenge.points} pts
              </span>
            </div>
          </div>

          {/* Action */}
          {isCompleted ? (
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-semibold">
              <Award className="h-4 w-4" />
              Done!
            </div>
          ) : isActive ? (
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-semibold">
              <Flame className="h-4 w-4" />
              In progress
            </div>
          ) : (
            <button
              onClick={() => onJoin(challenge.id)}
              disabled={isJoining}
              className={`
                group flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                transition-all duration-200
                bg-gradient-to-r ${catConfig.gradient} text-white
                hover:shadow-lg hover:scale-105 active:scale-95
                disabled:opacity-60 disabled:cursor-not-allowed
              `}
            >
              {isJoining ? (
                <span className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Join
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userChallenges'] });
      toast.success('Challenge joined! Good luck! 🌱');
    },
    onError: (error) => toast.error(extractError(error)),
  });

  const activeIds    = new Set(userChallenges.filter((uc) => uc.status === 'active').map((uc) => uc.challengeId));
  const completedIds = new Set(userChallenges.filter((uc) => uc.status === 'completed').map((uc) => uc.challengeId));
  const activeChallenges = userChallenges.filter((uc) => uc.status === 'active');

  const totalPoints = userChallenges.reduce((sum, uc) =>
    uc.status === 'completed' ? sum + (uc.challenge?.points ?? 0) : sum, 0);
  const totalSaved  = challenges
    .filter((c) => completedIds.has(c.id))
    .reduce((sum, c) => sum + c.co2Savings, 0);

  const grouped = challenges.reduce<Record<string, Challenge[]>>((acc, c) => {
    (acc[c.category] = acc[c.category] || []).push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-8">

      {/* ── Hero header ─────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 p-8 text-white shadow-2xl">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <Trophy className="h-7 w-7 text-amber-300" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Eco Challenges</h1>
            </div>
            <p className="text-green-100 text-base max-w-md leading-relaxed">
              Complete carbon reduction challenges, earn points, and make a real difference for the planet.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-4 flex-wrap">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 text-center min-w-[90px]">
              <div className="text-2xl font-extrabold text-amber-300">{totalPoints}</div>
              <div className="text-xs text-green-200 mt-0.5 font-medium">Points</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 text-center min-w-[90px]">
              <div className="text-2xl font-extrabold text-white">{completedIds.size}</div>
              <div className="text-xs text-green-200 mt-0.5 font-medium">Completed</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 text-center min-w-[90px]">
              <div className="text-2xl font-extrabold text-cyan-300">{totalSaved.toFixed(0)} kg</div>
              <div className="text-xs text-green-200 mt-0.5 font-medium">CO₂ Saved</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active challenges banner ─────────────────────────────── */}
      {activeChallenges.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Flame className="h-5 w-5 text-blue-500" />
            </div>
            <h2 className="text-lg font-bold text-carbon-900 dark:text-white">My Active Challenges</h2>
            <span className="ml-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
              {activeChallenges.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeChallenges.map((uc) => {
              const catCfg = CATEGORY_CONFIG[uc.challenge?.category ?? ''] ?? DEFAULT_CAT;
              return (
                <div key={uc.id}
                  className={`
                    relative rounded-2xl border overflow-hidden p-5
                    bg-white dark:bg-carbon-800
                    border-blue-200 dark:border-blue-800
                    shadow-md
                  `}
                >
                  <div className={`h-1 w-full bg-gradient-to-r ${catCfg.gradient} absolute top-0 left-0`} />
                  <div className="flex items-start gap-3 mt-1">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${catCfg.gradient} text-white shrink-0`}>
                      {catCfg.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-carbon-900 dark:text-white">{uc.challenge?.title}</p>
                      <p className="text-xs text-carbon-500 dark:text-carbon-400 mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {uc.challenge?.durationDays} days · Started {new Date(uc.startedAt).toLocaleDateString()}
                      </p>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-carbon-500 dark:text-carbon-400">Progress</span>
                          <span className={`font-semibold ${catCfg.accent}`}>{uc.progressPct}%</span>
                        </div>
                        <div className="h-2 bg-carbon-100 dark:bg-carbon-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${catCfg.gradient} rounded-full transition-all duration-700`}
                            style={{ width: `${uc.progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Category sections ────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="space-y-4">
              <div className="h-8 w-48 bg-carbon-100 dark:bg-carbon-800 rounded-xl animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-52 bg-carbon-100 dark:bg-carbon-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-20">
          <div className="p-5 bg-carbon-100 dark:bg-carbon-800 rounded-full inline-block mb-4">
            <Target className="h-12 w-12 text-carbon-400 dark:text-carbon-500" />
          </div>
          <h3 className="text-xl font-bold text-carbon-700 dark:text-carbon-300 mb-2">No challenges available</h3>
          <p className="text-carbon-500 dark:text-carbon-400">Check back soon for new eco challenges!</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([category, catChallenges]) => {
            const catCfg = CATEGORY_CONFIG[category] ?? DEFAULT_CAT;
            const completedInCat = catChallenges.filter((c) => completedIds.has(c.id)).length;

            return (
              <div key={category}>
                {/* Category header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${catCfg.gradient} text-white shadow-md`}>
                      {catCfg.icon}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-carbon-900 dark:text-white capitalize">
                        {category} Challenges
                      </h2>
                      <p className="text-xs text-carbon-500 dark:text-carbon-400">
                        {completedInCat}/{catChallenges.length} completed
                      </p>
                    </div>
                  </div>

                  {/* Mini progress bar */}
                  <div className="hidden sm:flex items-center gap-2 text-xs text-carbon-400 dark:text-carbon-500">
                    <div className="w-24 h-1.5 bg-carbon-100 dark:bg-carbon-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${catCfg.gradient} rounded-full transition-all`}
                        style={{ width: `${catChallenges.length ? (completedInCat / catChallenges.length) * 100 : 0}%` }}
                      />
                    </div>
                    <Users className="h-3.5 w-3.5" />
                    <span>{catChallenges.reduce((s, c) => s + c.points, 0)} pts total</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {catChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      isActive={activeIds.has(challenge.id)}
                      isCompleted={completedIds.has(challenge.id)}
                      onJoin={(id) => joinMutation.mutate(id)}
                      isJoining={joinMutation.isPending && joinMutation.variables === challenge.id}
                      catConfig={catCfg}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Bottom motivational banner ───────────────────────────── */}
      {!isLoading && challenges.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-carbon-900 to-carbon-800 dark:from-carbon-950 dark:to-carbon-900 p-6 text-white flex items-center gap-4 shadow-xl">
          <div className="p-3 bg-white/10 rounded-xl shrink-0">
            <TrendingDown className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <p className="font-bold text-lg">Every challenge matters 🌍</p>
            <p className="text-carbon-300 text-sm mt-0.5">
              Complete all challenges to reduce up to{' '}
              <span className="text-green-400 font-semibold">
                {challenges.reduce((s, c) => s + c.co2Savings, 0).toFixed(0)} kg
              </span>{' '}
              of CO₂ — that's the equivalent of planting{' '}
              <span className="text-green-400 font-semibold">
                {Math.round(challenges.reduce((s, c) => s + c.co2Savings, 0) / 21)} trees
              </span>!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challenges;
