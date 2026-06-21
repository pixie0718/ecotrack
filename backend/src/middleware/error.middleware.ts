import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { env } from '../config/environment';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    code: 'ROUTE_NOT_FOUND',
  });
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.headers['x-request-id'] as string;

  logger.error('Request error', {
    requestId,
    error: error.message,
    stack: env.NODE_ENV !== 'production' ? error.stack : undefined,
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  // ValidationError must be checked before AppError (it extends AppError)
  if (error instanceof ValidationError) {
    res.status(422).json({
      success: false,
      message: error.message,
      code: error.code,
      errors: error.fields,
      requestId,
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
      requestId,
    });
    return;
  }

  if (error instanceof ZodError) {
    const fields: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const path = issue.path.join('.');
      fields[path] = [...(fields[path] ?? []), issue.message];
    }
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: fields,
      requestId,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    handlePrismaError(error, res, requestId);
    return;
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      message: 'Invalid request data',
      code: 'INVALID_DATA',
      requestId,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    code: 'INTERNAL_ERROR',
    requestId,
  });
}

function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError,
  res: Response,
  requestId?: string
): void {
  switch (error.code) {
    case 'P2002':
      res.status(409).json({
        success: false,
        message: 'A record with these details already exists',
        code: 'DUPLICATE_ENTRY',
        requestId,
      });
      break;
    case 'P2025':
      res.status(404).json({
        success: false,
        message: 'Record not found',
        code: 'NOT_FOUND',
        requestId,
      });
      break;
    default:
      res.status(500).json({
        success: false,
        message: 'Database error',
        code: 'DB_ERROR',
        requestId,
      });
  }
}
