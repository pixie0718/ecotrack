import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { env } from '../config/environment';
import { logger } from '../utils/logger';
import { GLOBAL_AVERAGES } from '../utils/carbon-calculator';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export interface UserCarbonData {
  userId: string;
  totalMonthlyKg: number;
  categoryBreakdown: Array<{ category: string; co2Kg: number; percentage: number }>;
  monthlyTrend: Array<{ month: string; co2Kg: number }>;
  topActivities: Array<{ subcategory: string; co2Kg: number }>;
  profileData?: {
    dietType: string;
    vehicleType?: string | null;
    country?: string | null;
    targetReduction: number;
  };
}

export interface AIInsights {
  summary: string;
  topImpactAreas: string[];
  personalizedTips: Array<{
    category: string;
    tip: string;
    potentialSavingKg: number;
    difficulty: 'easy' | 'medium' | 'hard';
    priority: 'high' | 'medium' | 'low';
  }>;
  weeklyChallenge: {
    title: string;
    description: string;
    estimatedSaving: number;
  };
  motivationalMessage: string;
  comparisonToAverage: string;
}

export class GeminiService {
  private model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      temperature: 0.4,
      topK: 32,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  });

  async generateInsights(data: UserCarbonData): Promise<AIInsights> {
    const prompt = this.buildInsightsPrompt(data);

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();

      return this.parseInsightsResponse(text, data);
    } catch (error) {
      logger.error('Gemini insights generation failed', { error, userId: data.userId });
      return this.getFallbackInsights(data);
    }
  }

  async generateCarbonTip(category: string, subcategory: string): Promise<string> {
    const prompt = `Provide one specific, actionable tip to reduce carbon footprint from "${subcategory}" in the "${category}" category.
    Keep it under 100 words. Be practical and positive. Do not include markdown formatting.`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      logger.error('Gemini tip generation failed', { error, category, subcategory });
      return this.getDefaultTip(category);
    }
  }

  async generateWeeklyChallenge(profile: {
    topCategory: string;
    currentFootprint: number;
  }): Promise<{ title: string; description: string; estimatedSaving: number }> {
    const prompt = `Create a specific weekly carbon footprint challenge for someone whose biggest carbon source is "${profile.topCategory}".
    Their current footprint is ${Math.round(profile.currentFootprint)} kg CO2e/month.

    Respond in JSON format:
    {
      "title": "short challenge title",
      "description": "2-3 sentence description of the challenge",
      "estimatedSaving": number (kg CO2 saved for the week)
    }`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      logger.error('Gemini challenge generation failed', { error });
    }

    return {
      title: `Reduce Your ${profile.topCategory} Emissions`,
      description: `Focus on reducing your ${profile.topCategory.toLowerCase()} footprint this week with small daily changes.`,
      estimatedSaving: 5,
    };
  }

  private buildInsightsPrompt(data: UserCarbonData): string {
    const annualEstimate = data.totalMonthlyKg * 12;
    const worldAvg = GLOBAL_AVERAGES.world;
    const comparisonPct = Math.round(((annualEstimate - worldAvg) / worldAvg) * 100);

    const topCategory = data.categoryBreakdown.sort((a, b) => b.co2Kg - a.co2Kg)[0];

    return `You are an expert carbon footprint coach. Analyze this user's carbon data and provide personalized insights.

USER CARBON DATA:
- Monthly footprint: ${data.totalMonthlyKg.toFixed(1)} kg CO2e
- Estimated annual: ${annualEstimate.toFixed(0)} kg CO2e (World avg: ${worldAvg} kg)
- Comparison: ${comparisonPct > 0 ? '+' : ''}${comparisonPct}% vs world average
- Top category: ${topCategory?.category ?? 'unknown'} (${topCategory?.co2Kg.toFixed(1)} kg, ${topCategory?.percentage}%)
- Diet type: ${data.profileData?.dietType ?? 'unknown'}
- Vehicle: ${data.profileData?.vehicleType ?? 'none'}
- Target reduction: ${data.profileData?.targetReduction ?? 20}%

CATEGORY BREAKDOWN:
${data.categoryBreakdown.map((c) => `- ${c.category}: ${c.co2Kg.toFixed(1)} kg (${c.percentage}%)`).join('\n')}

TOP ACTIVITIES (highest emissions):
${data.topActivities.slice(0, 5).map((a) => `- ${a.subcategory}: ${a.co2Kg.toFixed(2)} kg`).join('\n')}

Respond ONLY with a valid JSON object in this exact structure:
{
  "summary": "2-3 sentence personalized summary of their carbon footprint situation",
  "topImpactAreas": ["area1", "area2", "area3"],
  "personalizedTips": [
    {
      "category": "category name",
      "tip": "specific actionable tip",
      "potentialSavingKg": 0.0,
      "difficulty": "easy|medium|hard",
      "priority": "high|medium|low"
    }
  ],
  "weeklyChallenge": {
    "title": "challenge title",
    "description": "challenge description",
    "estimatedSaving": 0.0
  },
  "motivationalMessage": "short encouraging message",
  "comparisonToAverage": "comparison context sentence"
}

Provide exactly 5 personalizedTips. Be specific, practical, and encouraging.`;
  }

  private parseInsightsResponse(text: string, data: UserCarbonData): AIInsights {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields exist
      if (!parsed.summary || !parsed.personalizedTips) {
        throw new Error('Missing required fields');
      }

      return parsed as AIInsights;
    } catch (error) {
      logger.warn('Failed to parse Gemini response, using fallback', { error });
      return this.getFallbackInsights(data);
    }
  }

  private getFallbackInsights(data: UserCarbonData): AIInsights {
    const topCategory = data.categoryBreakdown.sort((a, b) => b.co2Kg - a.co2Kg)[0];
    const annualKg = data.totalMonthlyKg * 12;

    return {
      summary: `Your monthly carbon footprint is ${data.totalMonthlyKg.toFixed(1)} kg CO2e. Your biggest impact area is ${topCategory?.category ?? 'transport'}.`,
      topImpactAreas: data.categoryBreakdown.slice(0, 3).map((c) => c.category),
      personalizedTips: [
        { category: 'transport', tip: 'Walk or cycle for trips under 5km', potentialSavingKg: 15, difficulty: 'easy', priority: 'high' },
        { category: 'energy', tip: 'Switch to LED bulbs and unplug devices when not in use', potentialSavingKg: 10, difficulty: 'easy', priority: 'medium' },
        { category: 'food', tip: 'Try 2-3 meat-free meals per week', potentialSavingKg: 20, difficulty: 'medium', priority: 'high' },
        { category: 'shopping', tip: 'Buy second-hand or repair instead of buying new', potentialSavingKg: 8, difficulty: 'easy', priority: 'medium' },
        { category: 'waste', tip: 'Compost food scraps and reduce food waste', potentialSavingKg: 5, difficulty: 'easy', priority: 'low' },
      ],
      weeklyChallenge: {
        title: `Zero-waste ${topCategory?.category ?? 'day'} challenge`,
        description: `Spend one day this week minimizing your ${topCategory?.category ?? 'daily'} emissions.`,
        estimatedSaving: 5,
      },
      motivationalMessage: 'Every small action adds up to meaningful change. Keep going!',
      comparisonToAverage: `Your annual footprint of ${annualKg.toFixed(0)} kg CO2e compares to the global average of ${GLOBAL_AVERAGES.world} kg.`,
    };
  }

  private getDefaultTip(category: string): string {
    const tips: Record<string, string> = {
      transport: 'Consider walking, cycling, or public transport for shorter journeys.',
      energy: 'Turn off lights and unplug electronics when not in use.',
      food: 'Try incorporating more plant-based meals into your diet.',
      shopping: 'Buy only what you need and choose durable, repairable products.',
      waste: 'Recycle, compost, and reduce single-use items.',
    };
    return tips[category] ?? 'Make small, consistent changes to reduce your carbon footprint.';
  }
}

export const geminiService = new GeminiService();
