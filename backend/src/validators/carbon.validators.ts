import { z } from 'zod';

const VALID_CATEGORIES = ['transport', 'energy', 'food', 'shopping', 'waste'] as const;

export const logActivitySchema = z.object({
  body: z.object({
    category: z.enum(VALID_CATEGORIES, {
      errorMap: () => ({ message: 'Invalid category' }),
    }),
    subcategory: z
      .string()
      .min(1, 'Subcategory is required')
      .max(100)
      .regex(/^[a-z0-9_]+$/, 'Subcategory must be lowercase alphanumeric with underscores'),
    description: z.string().max(500).optional(),
    quantity: z
      .number({ coerce: true })
      .positive('Quantity must be positive')
      .max(100000, 'Quantity seems unrealistically large'),
    unit: z.string().min(1).max(20),
    date: z
      .string()
      .datetime({ offset: true })
      .optional()
      .transform((v) => (v ? new Date(v) : new Date())),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    dietType: z
      .enum(['vegan', 'vegetarian', 'pescatarian', 'omnivore', 'heavy_meat'])
      .optional(),
    vehicleType: z
      .enum(['none', 'electric', 'hybrid', 'petrol', 'diesel'])
      .nullable()
      .optional(),
    homeSize: z.enum(['small', 'medium', 'large']).nullable().optional(),
    householdSize: z.number({ coerce: true }).int().min(1).max(20).optional(),
    renewableEnergyPct: z.number({ coerce: true }).min(0).max(100).optional(),
    monthlyFlights: z.number({ coerce: true }).int().min(0).max(100).optional(),
    weeklyCarKm: z.number({ coerce: true }).min(0).max(10000).optional(),
    monthlyElectricityKwh: z.number({ coerce: true }).min(0).max(10000).optional(),
    monthlyGasM3: z.number({ coerce: true }).min(0).max(10000).optional(),
    targetReduction: z.number({ coerce: true }).min(1).max(100).optional(),
    country: z.string().max(100).optional(),
  }),
});

export const dateRangeSchema = z.object({
  query: z.object({
    startDate: z.string().datetime({ offset: true }).optional(),
    endDate: z.string().datetime({ offset: true }).optional(),
    category: z.enum(VALID_CATEGORIES).optional(),
    page: z.string().default('1').transform(Number),
    limit: z.string().default('20').transform(Number),
  }),
});

export const joinChallengeSchema = z.object({
  params: z.object({
    challengeId: z.string().uuid('Invalid challenge ID'),
  }),
});

export type LogActivityInput = z.infer<typeof logActivitySchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type DateRangeQuery = z.infer<typeof dateRangeSchema>['query'];
