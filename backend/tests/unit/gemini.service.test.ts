import { GeminiService } from '../../src/services/gemini.service';
import type { UserCarbonData } from '../../src/services/gemini.service';

// Mock the Google Generative AI module
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn(),
    }),
  })),
  HarmCategory: {
    HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
    HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
    HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
  },
  HarmBlockThreshold: { BLOCK_MEDIUM_AND_ABOVE: 'BLOCK_MEDIUM_AND_ABOVE' },
}));

jest.mock('../../src/config/environment', () => ({
  env: { GEMINI_API_KEY: 'test-key' },
}));

jest.mock('../../src/utils/logger', () => ({
  logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

jest.mock('../../src/utils/carbon-calculator', () => ({
  GLOBAL_AVERAGES: { world: 4800, paris_target: 2000 },
}));

const SAMPLE_DATA: UserCarbonData = {
  userId: 'user-123',
  totalMonthlyKg: 350,
  categoryBreakdown: [
    { category: 'transport', co2Kg: 200, percentage: 57 },
    { category: 'energy',    co2Kg: 100, percentage: 29 },
    { category: 'food',      co2Kg: 50,  percentage: 14 },
  ],
  monthlyTrend: [{ month: 'Jan', co2Kg: 380 }, { month: 'Feb', co2Kg: 350 }],
  topActivities: [
    { subcategory: 'car_petrol_km', co2Kg: 150 },
    { subcategory: 'electricity_kwh', co2Kg: 100 },
  ],
  profileData: { dietType: 'omnivore', vehicleType: 'petrol', targetReduction: 20 },
};

const VALID_INSIGHTS_JSON = JSON.stringify({
  summary: 'Your footprint is 350 kg CO2e/month.',
  topImpactAreas: ['transport', 'energy', 'food'],
  personalizedTips: [
    { category: 'transport', tip: 'Walk short distances', potentialSavingKg: 15, difficulty: 'easy', priority: 'high' },
    { category: 'energy', tip: 'Use LED bulbs', potentialSavingKg: 10, difficulty: 'easy', priority: 'medium' },
    { category: 'food', tip: 'Try plant-based meals', potentialSavingKg: 20, difficulty: 'medium', priority: 'high' },
    { category: 'shopping', tip: 'Buy second-hand', potentialSavingKg: 8, difficulty: 'easy', priority: 'medium' },
    { category: 'waste', tip: 'Compost food scraps', potentialSavingKg: 5, difficulty: 'easy', priority: 'low' },
  ],
  weeklyChallenge: { title: 'Car-free week', description: 'Avoid driving for 7 days.', estimatedSaving: 35 },
  motivationalMessage: 'Every action counts!',
  comparisonToAverage: 'Below world average.',
});

describe('GeminiService', () => {
  let service: GeminiService;
  let mockGenerateContent: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new GeminiService();
    // Access the private model mock
    mockGenerateContent = (service as any).model.generateContent;
  });

  describe('generateInsights', () => {
    it('returns parsed insights when Gemini responds with valid JSON', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => VALID_INSIGHTS_JSON },
      });

      const result = await service.generateInsights(SAMPLE_DATA);

      expect(result.summary).toBe('Your footprint is 350 kg CO2e/month.');
      expect(result.personalizedTips).toHaveLength(5);
      expect(result.topImpactAreas).toEqual(['transport', 'energy', 'food']);
    });

    it('returns fallback insights when Gemini API throws an error', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('API quota exceeded'));

      const result = await service.generateInsights(SAMPLE_DATA);

      // Fallback should still return a valid structure
      expect(result.summary).toBeDefined();
      expect(result.personalizedTips).toHaveLength(5);
      expect(result.motivationalMessage).toBeDefined();
    });

    it('returns fallback when Gemini response contains no JSON', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => 'Sorry, I cannot help with that.' },
      });

      const result = await service.generateInsights(SAMPLE_DATA);

      expect(result.personalizedTips).toHaveLength(5);
    });

    it('fallback insights are personalised to user top category', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('fail'));

      const result = await service.generateInsights(SAMPLE_DATA);

      // Weekly challenge should reference the top category (transport)
      expect(result.weeklyChallenge.title.toLowerCase()).toContain('transport');
    });
  });

  describe('generateCarbonTip', () => {
    it('returns a tip string from Gemini', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => 'Take the bus instead of driving.' },
      });

      const result = await service.generateCarbonTip('transport', 'car_petrol_km');

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns a default tip when Gemini fails', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('fail'));

      const result = await service.generateCarbonTip('transport', 'car_petrol_km');

      expect(result).toContain('transport');
    });
  });

  describe('generateWeeklyChallenge', () => {
    it('returns a structured challenge from valid JSON response', async () => {
      const challengeJson = JSON.stringify({
        title: 'Car-free week',
        description: 'Avoid driving for 7 days.',
        estimatedSaving: 35,
      });
      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => challengeJson },
      });

      const result = await service.generateWeeklyChallenge({
        topCategory: 'transport',
        currentFootprint: 350,
      });

      expect(result.title).toBe('Car-free week');
      expect(result.estimatedSaving).toBe(35);
    });

    it('returns default challenge when Gemini fails', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('fail'));

      const result = await service.generateWeeklyChallenge({
        topCategory: 'energy',
        currentFootprint: 200,
      });

      expect(result.title).toContain('energy');
      expect(typeof result.estimatedSaving).toBe('number');
    });
  });
});
