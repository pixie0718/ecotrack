import { Request, Response, NextFunction } from 'express';
import { carbonService } from '../services/carbon.service';
import { sendSuccess } from '../types/express.types';

interface ActivityQueryParams {
  startDate?: string;
  endDate?: string;
  category?: string;
  page?: string;
  limit?: string;
}

export class CarbonController {
  /**
   * Logs a new carbon activity for the authenticated user.
   * `req.user` is guaranteed by the `authenticate` middleware.
   */
  async logActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activity = await carbonService.logActivity(req.user!.id, req.body);
      sendSuccess(res, activity, 201, 'Activity logged successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Returns a paginated list of the user's logged carbon activities.
   * `req.user` is guaranteed by the `authenticate` middleware.
   */
  async getActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, category, page, limit } = req.query as ActivityQueryParams;
      const result = await carbonService.getActivities(req.user!.id, {
        startDate,
        endDate,
        category,
        page:  Number(page)  || 1,
        limit: Math.min(Number(limit) || 20, 100),
      });
      sendSuccess(res, result.activities, 200, undefined, {
        page:       result.page,
        limit:      result.limit,
        total:      result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletes a specific activity that belongs to the authenticated user.
   * `req.user` is guaranteed by the `authenticate` middleware.
   */
  async deleteActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as Record<string, string>;
      await carbonService.deleteActivity(req.user!.id, id);
      sendSuccess(res, null, 200, 'Activity deleted');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Returns aggregated dashboard statistics for the authenticated user.
   * `req.user` is guaranteed by the `authenticate` middleware.
   */
  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await carbonService.getDashboardStats(req.user!.id);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Returns the authenticated user's saved carbon footprint profile.
   * `req.user` is guaranteed by the `authenticate` middleware.
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await carbonService.getProfile(req.user!.id);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates the authenticated user's carbon footprint profile.
   * `req.user` is guaranteed by the `authenticate` middleware.
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await carbonService.updateProfile(req.user!.id, req.body);
      sendSuccess(res, profile, 200, 'Profile updated');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Returns AI-generated carbon reduction insights via Google Gemini.
   * `req.user` is guaranteed by the `authenticate` middleware.
   */
  async getInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const insights = await carbonService.getAIInsights(req.user!.id);
      sendSuccess(res, insights);
    } catch (error) {
      next(error);
    }
  }

  /** Returns all available eco-challenges. */
  async getChallenges(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const challenges = await carbonService.getChallenges();
      sendSuccess(res, challenges);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Enrolls the authenticated user in a specific challenge.
   * `req.user` is guaranteed by the `authenticate` middleware.
   */
  async joinChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { challengeId } = req.params as Record<string, string>;
      const result = await carbonService.joinChallenge(req.user!.id, challengeId);
      sendSuccess(res, result, 201, 'Joined challenge');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Returns all challenges the authenticated user has joined.
   * `req.user` is guaranteed by the `authenticate` middleware.
   */
  async getUserChallenges(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const challenges = await carbonService.getUserChallenges(req.user!.id);
      sendSuccess(res, challenges);
    } catch (error) {
      next(error);
    }
  }
}

export const carbonController = new CarbonController();
