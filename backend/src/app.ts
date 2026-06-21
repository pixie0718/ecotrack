import express from 'express';
import {
  helmetMiddleware,
  corsMiddleware,
  compressionMiddleware,
  sanitizeMiddleware,
  hppMiddleware,
  requestIdMiddleware,
  securityLogger,
} from './middleware/security.middleware';
import { apiRateLimiter, speedLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';
import { env } from './config/environment';
import authRoutes from './routes/auth.routes';
import carbonRoutes from './routes/carbon.routes';

const app = express();

// Trust proxy (needed for accurate IP when behind nginx/load balancer)
app.set('trust proxy', 1);

// Security middleware (order matters)
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(requestIdMiddleware);
app.use(securityLogger);

// Body parsing with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Performance
app.use(compressionMiddleware);

// Data sanitization
app.use(sanitizeMiddleware);
app.use(hppMiddleware);

// Health check registered BEFORE rate limiter so load-balancer pings don't consume quota
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'carbon-footprint-api',
    version: env.API_VERSION,
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Rate limiting (applied after health check)
app.use(apiRateLimiter);
app.use(speedLimiter);

// Request logging
app.use((req, _res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    requestId: req.headers['x-request-id'],
  });
  next();
});

// API routes
const API_PREFIX = `/api/${env.API_VERSION}`;
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/carbon`, carbonRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
