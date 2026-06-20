import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { authRateLimiter } from '../middleware/rateLimiter.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from '../validators/auth.validators';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), authController.register.bind(authController));
router.post('/login', authRateLimiter, validate(loginSchema), authController.login.bind(authController));
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));
router.patch('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword.bind(authController));
router.get('/me', authenticate, authController.getMe.bind(authController));

export default router;
