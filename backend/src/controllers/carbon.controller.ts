import { Request, Response, NextFunction } from 'express';
import { carbonService } from '../services/carbon.service';
import { sendSuccess } from '../types/express.types';

export class CarbonController {
  async logActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const activity = await carbonService.logActivity(userId, req.body);
      sendSuccess(res, activity, 201, 'Activity logged successfully');
    } catch (error) {
      next(error);
    }
  }

  async getActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { startDate, endDate, category, page, limit } = req.query as any;
      const result = await carbonService.getActivities(userId, {
        startDate,
        endDate,
        category,
        page: Number(page) || 1,
        limit: Math.min(Number(limit) || 20, 100),
      });
      sendSuccess(res, result.activities, 200, undefined, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params as Record<string, string>;
      await carbonService.deleteActivity(userId, id);
      sendSuccess(res, null, 200, 'Activity deleted');
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const stats = await carbonService.getDashboardStats(userId);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const profile = await carbonService.updateProfile(userId, req.body);
      sendSuccess(res, profile, 200, 'Profile updated');
    } catch (error) {
      next(error);
    }
  }

  async getInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const insights = await carbonService.getAIInsights(userId);
      sendSuccess(res, insights);
    } catch (error) {
      next(error);
    }
  }

  async getChallenges(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const challenges = await carbonService.getChallenges();
      sendSuccess(res, challenges);
    } catch (error) {
      next(error);
    }
  }

  async joinChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { challengeId } = req.params as Record<string, string>;
      const result = await carbonService.joinChallenge(userId, challengeId);
      sendSuccess(res, result, 201, 'Joined challenge');
    } catch (error) {
      next(error);
    }
  }

  async getUserChallenges(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const challenges = await carbonService.getUserChallenges(userId);
      sendSuccess(res, challenges);
    } catch (error) {
      next(error);
    }
  }
}

export const carbonController = new CarbonController();
