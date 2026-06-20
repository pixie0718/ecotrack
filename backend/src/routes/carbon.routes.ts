import { Router } from 'express';
import { carbonController } from '../controllers/carbon.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { insightsRateLimiter } from '../middleware/rateLimiter.middleware';
import {
  logActivitySchema,
  updateProfileSchema,
  joinChallengeSchema,
} from '../validators/carbon.validators';

const router = Router();

// All carbon routes require authentication
router.use(authenticate);

// Dashboard
router.get('/dashboard', carbonController.getDashboard.bind(carbonController));

// Activities
router.post('/activities', validate(logActivitySchema), carbonController.logActivity.bind(carbonController));
router.get('/activities', carbonController.getActivities.bind(carbonController));
router.delete('/activities/:id', carbonController.deleteActivity.bind(carbonController));

// Profile / footprint settings
router.put('/profile', validate(updateProfileSchema), carbonController.updateProfile.bind(carbonController));

// AI Insights (rate limited - Gemini API calls)
router.get('/insights', insightsRateLimiter, carbonController.getInsights.bind(carbonController));

// Challenges
router.get('/challenges', carbonController.getChallenges.bind(carbonController));
router.get('/challenges/my', carbonController.getUserChallenges.bind(carbonController));
router.post('/challenges/:challengeId/join', validate(joinChallengeSchema), carbonController.joinChallenge.bind(carbonController));

export default router;
