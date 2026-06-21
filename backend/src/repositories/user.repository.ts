import { Prisma, User, UserProfile, RefreshToken } from '@prisma/client';
import { prisma } from '../config/database';

type UserWithProfile = Prisma.UserGetPayload<{
  include: {
    profile: true;
    achievements: { include: { achievement: true }; orderBy: { earnedAt: 'desc' } };
  };
}>;

type RefreshTokenWithUser = Prisma.RefreshTokenGetPayload<{
  include: { user: { select: { id: true; email: true; isActive: true } } };
}>;

export class UserRepository {
  /** Finds a user by their primary key. */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  /** Finds a user by their email address. */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  /** Finds a user by their username. */
  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username } });
  }

  /** Creates a new user record. */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  /** Updates fields on an existing user record. */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  /** Stamps the user's `lastLoginAt` field with the current timestamp. */
  async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } });
  }

  /** Soft-deletes a user by setting `isActive` to false. */
  async softDelete(id: string): Promise<void> {
    await prisma.user.update({ where: { id }, data: { isActive: false } });
  }

  /** Returns the carbon footprint profile for a user. */
  async getProfile(userId: string): Promise<UserProfile | null> {
    return prisma.userProfile.findUnique({ where: { userId } });
  }

  /** Creates or updates the user's carbon footprint profile. */
  async upsertProfile(userId: string, data: Prisma.UserProfileUpdateInput): Promise<UserProfile> {
    return prisma.userProfile.upsert({
      where:  { userId },
      create: { ...(data as Prisma.UserProfileUncheckedCreateInput), userId },
      update: data,
    });
  }

  /** Returns a user with their profile and earned achievements included. */
  async findWithProfile(id: string): Promise<UserWithProfile | null> {
    return prisma.user.findUnique({
      where:   { id },
      include: {
        profile:      true,
        achievements: {
          include:  { achievement: true },
          orderBy:  { earnedAt: 'desc' },
        },
      },
    });
  }

  /** Persists a new refresh token record linked to the given user. */
  async storeRefreshToken(data: {
    userId:       string;
    token:        string;
    fingerprint?: string;
    ipAddress?:   string;
    userAgent?:   string;
    expiresAt:    Date;
  }): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  }

  /** Looks up a refresh token and includes basic user fields for validation. */
  async findRefreshToken(token: string): Promise<RefreshTokenWithUser | null> {
    return prisma.refreshToken.findUnique({
      where:   { token },
      include: { user: { select: { id: true, email: true, isActive: true } } },
    });
  }

  /** Marks a single refresh token as revoked. */
  async revokeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token },
      data:  { revokedAt: new Date() },
    });
  }

  /** Revokes all active refresh tokens for a user (used on reuse detection). */
  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data:  { revokedAt: new Date() },
    });
  }

  /** Deletes refresh tokens that have passed their expiry date. */
  async cleanExpiredTokens(): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}

export const userRepository = new UserRepository();
