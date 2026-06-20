import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { userRepository } from '../repositories/user.repository';
import { signAccessToken, signRefreshToken, verifyRefreshToken, getRefreshTokenExpiry } from '../utils/token.utils';
import { AppError, ConflictError, UnauthorizedError } from '../utils/AppError';
import { env } from '../config/environment';
import { logger } from '../utils/logger';
import type { RegisterInput, LoginInput } from '../validators/auth.validators';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResult {
  user: Omit<User, 'passwordHash'>;
  tokens: AuthTokens;
}

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResult> {
    const { email, username, password, firstName, lastName } = input;

    // Check for existing email and username concurrently
    const [existingEmail, existingUsername] = await Promise.all([
      userRepository.findByEmail(email),
      userRepository.findByUsername(username),
    ]);

    if (existingEmail) {
      throw new ConflictError('An account with this email already exists');
    }
    if (existingUsername) {
      throw new ConflictError('This username is already taken');
    }

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

    const user = await userRepository.create({
      email,
      username,
      passwordHash,
      firstName,
      lastName,
    });

    // Create default profile
    await userRepository.upsertProfile(user.id, {
      dietType: 'omnivore',
      householdSize: 1,
    });

    const tokens = await this.generateTokens(user.id, user.email);

    logger.info('User registered', { userId: user.id, email: user.email });

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, tokens };
  }

  async login(
    input: LoginInput,
    meta: { ip?: string; userAgent?: string }
  ): Promise<AuthResult> {
    const { email, password } = input;

    const user = await userRepository.findByEmail(email);

    // Always hash to prevent timing attacks even if user not found
    const dummyHash = '$2a$12$dummy.hash.to.prevent.timing.attack.xxxxxxxxxx';
    const passwordHash = user?.passwordHash ?? dummyHash;

    const isPasswordValid = await bcrypt.compare(password, passwordHash);

    if (!user || !isPasswordValid) {
      // Don't reveal which field was wrong
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('This account has been deactivated');
    }

    const tokens = await this.generateTokens(user.id, user.email, meta);
    await userRepository.updateLastLogin(user.id);

    logger.info('User logged in', { userId: user.id, ip: meta.ip });

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, tokens };
  }

  async refreshTokens(
    token: string,
    meta: { ip?: string; userAgent?: string }
  ): Promise<AuthTokens> {
    const payload = verifyRefreshToken(token);

    const storedToken = await userRepository.findRefreshToken(token);

    if (!storedToken || storedToken.revokedAt || new Date() > storedToken.expiresAt) {
      // If token was already revoked, it might be a replay attack - revoke all tokens
      if (storedToken?.revokedAt) {
        await userRepository.revokeAllUserRefreshTokens(payload.sub);
        logger.warn('Refresh token reuse detected - all tokens revoked', {
          userId: payload.sub,
          ip: meta.ip,
        });
      }
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    if (!storedToken.user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Rotate: revoke old token, issue new pair (refresh token rotation)
    await userRepository.revokeRefreshToken(token);

    return this.generateTokens(storedToken.user.id, storedToken.user.email, meta);
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await userRepository.revokeRefreshToken(refreshToken);
    } else {
      await userRepository.revokeAllUserRefreshTokens(userId);
    }
    logger.info('User logged out', { userId });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new UnauthorizedError('Current password is incorrect');

    const newHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);
    await userRepository.update(userId, { passwordHash: newHash });

    // Revoke all existing refresh tokens (force re-login)
    await userRepository.revokeAllUserRefreshTokens(userId);

    logger.info('Password changed', { userId });
  }

  private async generateTokens(
    userId: string,
    email: string,
    meta?: { ip?: string; userAgent?: string }
  ): Promise<AuthTokens> {
    const accessToken = signAccessToken(userId, email);
    const refreshToken = signRefreshToken(userId, email);

    await userRepository.storeRefreshToken({
      userId,
      token: refreshToken,
      ipAddress: meta?.ip,
      userAgent: meta?.userAgent,
      expiresAt: getRefreshTokenExpiry(),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }
}

export const authService = new AuthService();
