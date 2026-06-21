import { CarbonActivity, MonthlyFootprint, Prisma, UserChallenge, Challenge } from '@prisma/client';
import { prisma } from '../config/database';

export interface ActivityFilter {
  userId:     string;
  startDate?: Date;
  endDate?:   Date;
  category?:  string;
  page?:      number;
  limit?:     number;
}

export interface PaginatedActivities {
  activities: CarbonActivity[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export interface MonthlyAggregate {
  activities:  CarbonActivity[];
  byCategory:  Record<string, number>;
  total:       number;
}

export class CarbonRepository {
  /** Persists a new carbon activity record to the database. */
  async createActivity(data: Prisma.CarbonActivityCreateInput): Promise<CarbonActivity> {
    return prisma.carbonActivity.create({ data });
  }

  /** Retrieves a paginated, filtered list of activities for a user. */
  async findActivities(filter: ActivityFilter): Promise<PaginatedActivities> {
    const { userId, startDate, endDate, category, page = 1, limit = 20 } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.CarbonActivityWhereInput = {
      userId,
      ...(startDate && { date: { gte: startDate } }),
      ...(endDate   && { date: { lte: endDate } }),
      ...(category  && { category }),
    };

    const [activities, total] = await Promise.all([
      prisma.carbonActivity.findMany({ where, orderBy: { date: 'desc' }, skip, take: limit }),
      prisma.carbonActivity.count({ where }),
    ]);

    return { activities, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Deletes an activity that belongs to the specified user.
   * @returns `true` on success, `false` if the record was not found.
   */
  async deleteActivity(id: string, userId: string): Promise<boolean> {
    try {
      await prisma.carbonActivity.delete({ where: { id, userId } });
      return true;
    } catch {
      return false;
    }
  }

  /** Aggregates all activities for a given user, year, and month by category. */
  async getMonthlyAggregate(userId: string, year: number, month: number): Promise<MonthlyAggregate> {
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 0, 23, 59, 59, 999);

    const activities = await prisma.carbonActivity.findMany({
      where: { userId, date: { gte: start, lte: end } },
    });

    const byCategory: Record<string, number> = {};
    let total = 0;

    for (const activity of activities) {
      byCategory[activity.category] = (byCategory[activity.category] ?? 0) + activity.co2Kg;
      total += activity.co2Kg;
    }

    return { activities, byCategory, total };
  }

  /** Creates or updates the pre-aggregated monthly footprint record for a user. */
  async upsertMonthlyFootprint(data: {
    userId:         string;
    year:           number;
    month:          number;
    totalCo2Kg:     number;
    transportCo2:   number;
    energyCo2:      number;
    foodCo2:        number;
    shoppingCo2:    number;
    wasteCo2:       number;
    treeEquivalent: number;
  }): Promise<MonthlyFootprint> {
    return prisma.monthlyFootprint.upsert({
      where:  { userId_year_month: { userId: data.userId, year: data.year, month: data.month } },
      create: data,
      update: data,
    });
  }

  /** Returns the most recent monthly footprint records for a user. */
  async getMonthlyFootprints(userId: string, months = 12): Promise<MonthlyFootprint[]> {
    return prisma.monthlyFootprint.findMany({
      where:   { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take:    months,
    });
  }

  /** Sums all CO₂ emissions logged by the user today (local midnight to 23:59:59). */
  async getTodayTotal(userId: string): Promise<number> {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end   = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const result = await prisma.carbonActivity.aggregate({
      where: { userId, date: { gte: start, lte: end } },
      _sum:  { co2Kg: true },
    });

    return result._sum.co2Kg ?? 0;
  }

  /** Sums CO₂ emissions for the rolling 7-day window ending now. */
  async getWeekTotal(userId: string): Promise<number> {
    const now       = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    const result = await prisma.carbonActivity.aggregate({
      where: { userId, date: { gte: weekStart } },
      _sum:  { co2Kg: true },
    });

    return result._sum.co2Kg ?? 0;
  }

  /** Returns the most recently logged activities for a user, newest first. */
  async getRecentActivities(userId: string, limit = 10): Promise<CarbonActivity[]> {
    return prisma.carbonActivity.findMany({
      where:   { userId },
      orderBy: { date: 'desc' },
      take:    limit,
    });
  }

  /** Groups CO₂ emissions by category for a user within the given date range. */
  async getCategoryBreakdown(userId: string, startDate: Date, endDate: Date) {
    return prisma.carbonActivity.groupBy({
      by:     ['category'],
      where:  { userId, date: { gte: startDate, lte: endDate } },
      _sum:   { co2Kg: true },
      _count: { id: true },
    });
  }

  /** Returns all active challenges, ordered by highest CO₂ savings potential. */
  async getChallenges(): Promise<Challenge[]> {
    return prisma.challenge.findMany({
      where:   { isActive: true },
      orderBy: { co2Savings: 'desc' },
    });
  }

  /** Enrolls a user in a challenge, or re-activates a previously abandoned one. */
  async joinChallenge(userId: string, challengeId: string): Promise<UserChallenge> {
    return prisma.userChallenge.upsert({
      where:  { userId_challengeId: { userId, challengeId } },
      create: { userId, challengeId, status: 'active' },
      update: { status: 'active', startedAt: new Date() },
    });
  }

  /** Returns all challenges a user has joined, including challenge details. */
  async getUserChallenges(userId: string): Promise<Array<UserChallenge & { challenge: Challenge }>> {
    return prisma.userChallenge.findMany({
      where:   { userId },
      include: { challenge: true },
      orderBy: { startedAt: 'desc' },
    });
  }
}

export const carbonRepository = new CarbonRepository();
