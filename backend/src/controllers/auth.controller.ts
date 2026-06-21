import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../types/express.types';

export class AuthController {
  /** Registers a new user account and returns access + refresh tokens. */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, result, 201, 'Account created successfully');
    } catch (error) {
      next(error);
    }
  }

  /** Authenticates a user by email/password and returns access + refresh tokens. */
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

  /** Issues a new access token using a valid refresh token. */
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

  /**
   * Revokes the user's refresh token, ending the authenticated session.
   * `req.user` is guaranteed by the `authenticate` middleware.
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const refreshToken = req.body.refreshToken as string | undefined;
      await authService.logout(userId, refreshToken);
      sendSuccess(res, null, 200, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates the authenticated user's password after verifying the current one.
   * `req.user` is guaranteed by the `authenticate` middleware.
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(userId, currentPassword, newPassword);
      sendSuccess(res, null, 200, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Returns the authenticated user's id and email.
   * `req.user` is guaranteed by the `authenticate` middleware.
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, email } = req.user!;
      sendSuccess(res, { id, email });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
