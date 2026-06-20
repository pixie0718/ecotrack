import { CarbonActivity, MonthlyFootprint, Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export interface ActivityFilter {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  category?: string;
  page?: number;
  limit?: number;
}

export class CarbonRepository {
  async createActivity(data: Prisma.CarbonActivityCreateInput): Promise<CarbonActivity> {
    return prisma.carbonActivity.create({ data });
  }

  async findActivities(filter: ActivityFilter) {
    const { userId, startDate, endDate, category, page = 1, limit = 20 } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.CarbonActivityWhereInput = {
      userId,
      ...(startDate && { date: { gte: startDate } }),
      ...(endDate && { date: { lte: endDate } }),
      ...(category && { category }),
    };

    const [activities, total] = await Promise.all([
      prisma.carbonActivity.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.carbonActivity.count({ where }),
    ]);

    return { activities, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async deleteActivity(id: string, userId: string): Promise<boolean> {
    try {
      await prisma.carbonActivity.delete({
        where: { id, userId },
      });
      return true;
    } catch {
      return false;
    }
  }

  async getMonthlyAggregate(userId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

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

  async upsertMonthlyFootprint(data: {
    userId: string;
    year: number;
    month: number;
    totalCo2Kg: number;
    transportCo2: number;
    energyCo2: number;
    foodCo2: number;
    shoppingCo2: number;
    wasteCo2: number;
    treeEquivalent: number;
  }): Promise<MonthlyFootprint> {
    return prisma.monthlyFootprint.upsert({
      where: {
        userId_year_month: {
          userId: data.userId,
          year: data.year,
          month: data.month,
        },
      },
      create: data,
      update: data,
    });
  }

  async getMonthlyFootprints(userId: string, months = 12): Promise<MonthlyFootprint[]> {
    return prisma.monthlyFootprint.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: months,
    });
  }

  async getTodayTotal(userId: string): Promise<number> {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const result = await prisma.carbonActivity.aggregate({
      where: { userId, date: { gte: start, lte: end } },
      _sum: { co2Kg: true },
    });

    return result._sum.co2Kg ?? 0;
  }

  async getWeekTotal(userId: string): Promise<number> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    const result = await prisma.carbonActivity.aggregate({
      where: { userId, date: { gte: weekStart } },
      _sum: { co2Kg: true },
    });

    return result._sum.co2Kg ?? 0;
  }

  async getRecentActivities(userId: string, limit = 10): Promise<CarbonActivity[]> {
    return prisma.carbonActivity.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  async getCategoryBreakdown(userId: string, startDate: Date, endDate: Date) {
    return prisma.carbonActivity.groupBy({
      by: ['category'],
      where: { userId, date: { gte: startDate, lte: endDate } },
      _sum: { co2Kg: true },
      _count: { id: true },
    });
  }

  async getChallenges(status?: string) {
    return prisma.challenge.findMany({
      where: { isActive: true },
      orderBy: { co2Savings: 'desc' },
    });
  }

  async joinChallenge(userId: string, challengeId: string) {
    return prisma.userChallenge.upsert({
      where: { userId_challengeId: { userId, challengeId } },
      create: { userId, challengeId, status: 'active' },
      update: { status: 'active', startedAt: new Date() },
    });
  }

  async getUserChallenges(userId: string) {
    return prisma.userChallenge.findMany({
      where: { userId },
      include: { challenge: true },
      orderBy: { startedAt: 'desc' },
    });
  }
}

export const carbonRepository = new CarbonRepository();
