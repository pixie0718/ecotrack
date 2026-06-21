import { Prisma, User, UserProfile } from '@prisma/client';
import { prisma } from '../config/database';

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username } });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async softDelete(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    return prisma.userProfile.findUnique({ where: { userId } });
  }

  async upsertProfile(
    userId: string,
    data: Prisma.UserProfileUpdateInput
  ): Promise<UserProfile> {
    return prisma.userProfile.upsert({
      where: { userId },
      create: { ...(data as Prisma.UserProfileUncheckedCreateInput), userId },
      update: data,
    });
  }

  async findWithProfile(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        achievements: {
          include: { achievement: true },
          orderBy: { earnedAt: 'desc' },
        },
      },
    });
  }

  async storeRefreshToken(data: {
    userId: string;
    token: string;
    fingerprint?: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({ data });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true, isActive: true } } },
    });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async cleanExpiredTokens(): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}

export const userRepository = new UserRepository();
