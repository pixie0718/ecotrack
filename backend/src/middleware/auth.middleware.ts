import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.utils';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Authorization token required', 401, true, 'NO_TOKEN');
    }

    const token = authHeader.slice(7);

    if (!token || token.length < 10) {
      throw new AppError('Invalid token format', 401, true, 'INVALID_TOKEN');
    }

    const payload = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, isActive: true },
    });

    if (!user) {
      throw new AppError('User account not found', 401, true, 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new AppError('User account is deactivated', 403, true, 'ACCOUNT_DISABLED');
    }

    (req as any).user = { id: user.id, email: user.email };
    next();
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn('Auth failure', {
        error: error.message,
        ip: req.ip,
        path: req.path,
        code: error.code,
      });
    }
    next(error);
  }
}

// Optional authentication - does not fail if no token
export async function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  try {
    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, isActive: true },
    });
    if (user?.isActive) {
      (req as any).user = { id: user.id, email: user.email };
    }
  } catch {
    // Silently ignore auth errors for optional auth
  }
  next();
}
