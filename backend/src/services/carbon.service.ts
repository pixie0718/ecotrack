import { CarbonActivity } from '@prisma/client';
import { carbonRepository } from '../repositories/carbon.repository';
import { userRepository } from '../repositories/user.repository';
import { calculateCO2, estimateAnnualFootprint, getCategoryBreakdown, toTreeEquivalent, GLOBAL_AVERAGES } from '../utils/carbon-calculator';
import { AppError } from '../utils/AppError';
import { geminiService } from './gemini.service';
import type { LogActivityInput, UpdateProfileInput } from '../validators/carbon.validators';

export class CarbonService {
  async logActivity(
    userId: string,
    input: LogActivityInput
  ): Promise<CarbonActivity & { treeEquivalent: number }> {
    const co2Kg = calculateCO2({
      category: input.category,
      subcategory: input.subcategory,
      quantity: input.quantity,
      unit: input.unit,
    });

    const activity = await carbonRepository.createActivity({
      userId,
      category: input.category,
      subcategory: input.subcategory,
      description: input.description,
      quantity: input.quantity,
      unit: input.unit,
      co2Kg,
      date: input.date ?? new Date(),
      metadata: input.metadata as any,
      user: { connect: { id: userId } },
    });

    // Async: recalculate monthly footprint
    this.recalculateMonthlyFootprint(userId, activity.date).catch(console.error);

    return { ...activity, treeEquivalent: toTreeEquivalent(co2Kg) };
  }

  async getActivities(userId: string, filter: {
    startDate?: string;
    endDate?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    return carbonRepository.findActivities({
      userId,
      startDate: filter.startDate ? new Date(filter.startDate) : undefined,
      endDate: filter.endDate ? new Date(filter.endDate) : undefined,
      category: filter.category,
      page: filter.page,
      limit: filter.limit,
    });
  }

  async deleteActivity(userId: string, activityId: string): Promise<void> {
    const deleted = await carbonRepository.deleteActivity(activityId, userId);
    if (!deleted) {
      throw new AppError('Activity not found or unauthorized', 404);
    }
  }

  async getDashboardStats(userId: string) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const [todayTotal, weekTotal, monthlyFootprints, recentActivities, profile] =
      await Promise.all([
        carbonRepository.getTodayTotal(userId),
        carbonRepository.getWeekTotal(userId),
        carbonRepository.getMonthlyFootprints(userId, 12),
        carbonRepository.getRecentActivities(userId, 10),
        userRepository.getProfile(userId),
      ]);

    const currentMonthFp = monthlyFootprints.find(
      (fp) => fp.year === currentYear && fp.month === currentMonth
    );

    const prevMonthFp = monthlyFootprints.find(
      (fp) =>
        (currentMonth === 1 ? fp.year === currentYear - 1 && fp.month === 12 : fp.year === currentYear && fp.month === currentMonth - 1)
    );

    const monthlyChangePct = currentMonthFp && prevMonthFp && prevMonthFp.totalCo2Kg > 0
      ? ((currentMonthFp.totalCo2Kg - prevMonthFp.totalCo2Kg) / prevMonthFp.totalCo2Kg) * 100
      : null;

    const baseline = profile?.baselineFootprint;
    const annualEstimate = (currentMonthFp?.totalCo2Kg ?? 0) * 12;
    const reductionFromBaseline = baseline
      ? ((baseline - annualEstimate) / baseline) * 100
      : null;

    const treeEquivalent = toTreeEquivalent(currentMonthFp?.totalCo2Kg ?? 0);
    const globalComparison = {
      world: GLOBAL_AVERAGES.world / 12,
      paris_target: GLOBAL_AVERAGES.target_paris / 12,
    };

    return {
      today: { co2Kg: todayTotal, treeEquivalent: toTreeEquivalent(todayTotal) },
      thisWeek: { co2Kg: weekTotal },
      thisMonth: {
        co2Kg: currentMonthFp?.totalCo2Kg ?? 0,
        treeEquivalent,
        changePct: monthlyChangePct,
        breakdown: {
          transport: currentMonthFp?.transportCo2 ?? 0,
          energy: currentMonthFp?.energyCo2 ?? 0,
          food: currentMonthFp?.foodCo2 ?? 0,
          shopping: currentMonthFp?.shoppingCo2 ?? 0,
          waste: currentMonthFp?.wasteCo2 ?? 0,
        },
      },
      reductionFromBaseline,
      globalComparison,
      monthlyTrend: monthlyFootprints.reverse().map((fp) => ({
        year: fp.year,
        month: fp.month,
        label: `${fp.year}-${String(fp.month).padStart(2, '0')}`,
        co2Kg: fp.totalCo2Kg,
        treeEquivalent: fp.treeEquivalent,
      })),
      recentActivities,
    };
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const profile = await userRepository.upsertProfile(userId, {
      ...input,
      vehicleType: input.vehicleType ?? undefined,
    });

    // Recalculate baseline footprint from profile
    const baselineFootprint = estimateAnnualFootprint({
      dietType: profile.dietType,
      vehicleType: profile.vehicleType,
      weeklyCarKm: profile.weeklyCarKm,
      monthlyElectricityKwh: profile.monthlyElectricityKwh,
      monthlyGasM3: profile.monthlyGasM3,
      monthlyFlights: profile.monthlyFlights,
      householdSize: profile.householdSize,
      renewableEnergyPct: profile.renewableEnergyPct,
    });

    return userRepository.upsertProfile(userId, { baselineFootprint });
  }

  async getAIInsights(userId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [activities, monthlyFootprints, profile] = await Promise.all([
      carbonRepository.findActivities({ userId, startDate: monthStart, endDate: monthEnd, limit: 100 }),
      carbonRepository.getMonthlyFootprints(userId, 6),
      userRepository.getProfile(userId),
    ]);

    const categoryBreakdown = getCategoryBreakdown(activities.activities);
    const totalMonthlyKg = activities.activities.reduce((sum, a) => sum + a.co2Kg, 0);

    const topActivities = [...activities.activities]
      .sort((a, b) => b.co2Kg - a.co2Kg)
      .slice(0, 5)
      .map((a) => ({ subcategory: a.subcategory, co2Kg: a.co2Kg }));

    const monthlyTrend = monthlyFootprints
      .reverse()
      .map((fp) => ({
        month: `${fp.year}-${String(fp.month).padStart(2, '0')}`,
        co2Kg: fp.totalCo2Kg,
      }));

    const insights = await geminiService.generateInsights({
      userId,
      totalMonthlyKg,
      categoryBreakdown,
      monthlyTrend,
      topActivities,
      profileData: profile
        ? {
            dietType: profile.dietType,
            vehicleType: profile.vehicleType,
            country: null,
            targetReduction: profile.targetReduction,
          }
        : undefined,
    });

    return {
      insights,
      dataSnapshot: {
        totalMonthlyKg,
        categoryBreakdown,
        topActivities,
        monthlyTrend,
      },
    };
  }

  async getChallenges() {
    return carbonRepository.getChallenges();
  }

  async joinChallenge(userId: string, challengeId: string) {
    return carbonRepository.joinChallenge(userId, challengeId);
  }

  async getUserChallenges(userId: string) {
    return carbonRepository.getUserChallenges(userId);
  }

  private async recalculateMonthlyFootprint(userId: string, date: Date): Promise<void> {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const { byCategory, total } = await carbonRepository.getMonthlyAggregate(userId, year, month);

    await carbonRepository.upsertMonthlyFootprint({
      userId,
      year,
      month,
      totalCo2Kg: total,
      transportCo2: byCategory['transport'] ?? 0,
      energyCo2: byCategory['energy'] ?? 0,
      foodCo2: byCategory['food'] ?? 0,
      shoppingCo2: byCategory['shopping'] ?? 0,
      wasteCo2: byCategory['waste'] ?? 0,
      treeEquivalent: toTreeEquivalent(total),
    });
  }
}

export const carbonService = new CarbonService();
