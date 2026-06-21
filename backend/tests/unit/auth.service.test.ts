import bcrypt from 'bcryptjs';
import { AuthService } from '../../src/services/auth.service';
import { userRepository } from '../../src/repositories/user.repository';

jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/utils/token.utils', () => ({
  signAccessToken:       jest.fn().mockReturnValue('access-token'),
  signRefreshToken:      jest.fn().mockReturnValue('refresh-token'),
  verifyRefreshToken:    jest.fn().mockReturnValue({ sub: 'user-123' }),
  getRefreshTokenExpiry: jest.fn().mockReturnValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
}));
jest.mock('../../src/config/environment', () => ({
  env: { BCRYPT_SALT_ROUNDS: 10 },
}));
jest.mock('../../src/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const mockUserRepo = userRepository as jest.Mocked<typeof userRepository>;

const HASHED_PASSWORD = bcrypt.hashSync('Password1!', 10);

const MOCK_USER = {
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  passwordHash: HASHED_PASSWORD,
  firstName: 'Test',
  lastName: 'User',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: null,
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
    mockUserRepo.storeRefreshToken.mockResolvedValue({} as any);
    mockUserRepo.updateLastLogin.mockResolvedValue({} as any);
  });

  describe('login', () => {
    it('returns user and tokens on valid credentials', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(MOCK_USER as any);

      const result = await authService.login(
        { email: 'test@example.com', password: 'Password1!' },
        { ip: '127.0.0.1' }
      );

      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens.accessToken).toBe('access-token');
      expect(result.tokens.refreshToken).toBe('refresh-token');
      expect((result.user as any).passwordHash).toBeUndefined();
    });

    it('throws UnauthorizedError when user does not exist', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nobody@example.com', password: 'Password1!' }, {})
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('throws UnauthorizedError on wrong password', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(MOCK_USER as any);

      await expect(
        authService.login({ email: 'test@example.com', password: 'WrongPass1!' }, {})
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('throws UnauthorizedError when account is inactive', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ ...MOCK_USER, isActive: false } as any);

      await expect(
        authService.login({ email: 'test@example.com', password: 'Password1!' }, {})
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('does not reveal whether email or password was wrong (same error message)', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      const errorNoUser = await authService.login(
        { email: 'nobody@example.com', password: 'any' }, {}
      ).catch((e) => e);

      mockUserRepo.findByEmail.mockResolvedValue(MOCK_USER as any);
      const errorWrongPw = await authService.login(
        { email: 'test@example.com', password: 'WrongPass1!' }, {}
      ).catch((e) => e);

      expect(errorNoUser.message).toBe(errorWrongPw.message);
    });
  });

  describe('register', () => {
    it('creates user and returns tokens', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.findByUsername.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue(MOCK_USER as any);
      mockUserRepo.upsertProfile.mockResolvedValue({} as any);

      const result = await authService.register({
        email: 'new@example.com',
        username: 'newuser',
        password: 'Password1!',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens.accessToken).toBeDefined();
    });

    it('throws ConflictError when email already exists', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(MOCK_USER as any);
      mockUserRepo.findByUsername.mockResolvedValue(null);

      await expect(
        authService.register({ email: 'test@example.com', username: 'other', password: 'Password1!' })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('throws ConflictError when username already exists', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.findByUsername.mockResolvedValue(MOCK_USER as any);

      await expect(
        authService.register({ email: 'new@example.com', username: 'testuser', password: 'Password1!' })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('does not store plaintext password', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.findByUsername.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue(MOCK_USER as any);
      mockUserRepo.upsertProfile.mockResolvedValue({} as any);

      await authService.register({ email: 'new@example.com', username: 'newuser', password: 'Password1!' });

      const createCall = mockUserRepo.create.mock.calls[0][0];
      expect(createCall.passwordHash).not.toBe('Password1!');
      expect(createCall.passwordHash).toMatch(/^\$2[ab]\$/); // bcrypt hash prefix
    });
  });

  describe('logout', () => {
    it('revokes the provided refresh token', async () => {
      mockUserRepo.revokeRefreshToken.mockResolvedValue({} as any);

      await authService.logout('user-123', 'some-refresh-token');

      expect(mockUserRepo.revokeRefreshToken).toHaveBeenCalledWith('some-refresh-token');
    });

    it('revokes all tokens when no refresh token provided', async () => {
      mockUserRepo.revokeAllUserRefreshTokens.mockResolvedValue({} as any);

      await authService.logout('user-123');

      expect(mockUserRepo.revokeAllUserRefreshTokens).toHaveBeenCalledWith('user-123');
    });
  });
});
