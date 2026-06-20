import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { env } from '../config/environment';
import { logger } from '../utils/logger';

// General API rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  keyGenerator: (req) => req.ip ?? 'unknown',
  handler: (req, res, _next, options) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(options.statusCode).json(options.message);
  },
});

// Strict auth rate limiter (login, register, password reset)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failed attempts
  message: {
    success: false,
    message: 'Too many authentication attempts. Account temporarily locked.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
  handler: (req, res, _next, options) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });
    res.status(options.statusCode).json(options.message);
  },
});

// AI insights rate limiter (Gemini API calls are expensive)
export const insightsRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => (req as any).user?.id ?? req.ip ?? 'unknown',
  message: {
    success: false,
    message: 'AI insights limit reached. Please try again in an hour.',
    code: 'INSIGHTS_RATE_LIMIT_EXCEEDED',
  },
});

// Speed limiter - progressively slow down responses after threshold
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: (used, req) => {
    const delayAfter = (req as any).slowDown?.limit ?? 50;
    return (used - delayAfter) * 500;
  },
  maxDelayMs: 5000,
});
