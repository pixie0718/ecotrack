import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/environment';
import { AppError } from './AppError';

export interface TokenPayload {
  sub: string;  // user id
  email: string;
  jti: string;  // JWT ID for revocation
  type: 'access' | 'refresh';
}

export function signAccessToken(userId: string, email: string): string {
  const payload: Omit<TokenPayload, 'type'> = {
    sub: userId,
    email,
    jti: uuidv4(),
  };

  return jwt.sign({ ...payload, type: 'access' }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    algorithm: 'HS256',
    issuer: 'carbon-footprint-api',
    audience: 'carbon-footprint-client',
  } as SignOptions);
}

export function signRefreshToken(userId: string, email: string): string {
  const payload: Omit<TokenPayload, 'type'> = {
    sub: userId,
    email,
    jti: uuidv4(),
  };

  return jwt.sign({ ...payload, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    algorithm: 'HS256',
    issuer: 'carbon-footprint-api',
    audience: 'carbon-footprint-client',
  } as SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],
      issuer: 'carbon-footprint-api',
      audience: 'carbon-footprint-client',
    }) as JwtPayload & TokenPayload;

    if (decoded.type !== 'access') {
      throw new AppError('Invalid token type', 401);
    }

    return decoded;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Access token expired', 401);
    }
    throw new AppError('Invalid access token', 401);
  }
}

export function verifyRefreshToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
      algorithms: ['HS256'],
      issuer: 'carbon-footprint-api',
      audience: 'carbon-footprint-client',
    }) as JwtPayload & TokenPayload;

    if (decoded.type !== 'refresh') {
      throw new AppError('Invalid token type', 401);
    }

    return decoded;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Refresh token expired', 401);
    }
    throw new AppError('Invalid refresh token', 401);
  }
}

export function getRefreshTokenExpiry(): Date {
  const ms = 7 * 24 * 60 * 60 * 1000; // 7 days
  return new Date(Date.now() + ms);
}
