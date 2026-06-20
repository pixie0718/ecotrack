import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../types/express.types';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, result, 201, 'Account created successfully');
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
      sendSuccess(res, result, 200, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshTokens(refreshToken, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
      sendSuccess(res, { tokens }, 200, 'Tokens refreshed');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const refreshToken = req.body.refreshToken as string | undefined;
      await authService.logout(userId, refreshToken);
      sendSuccess(res, null, 200, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(userId, currentPassword, newPassword);
      sendSuccess(res, null, 200, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, email } = (req as any).user;
      sendSuccess(res, { id, email });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
