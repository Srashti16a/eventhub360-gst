import { z } from 'zod';

export const listCateringSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    mealCategory: z.string().optional(), // 'Vegan', 'Vegetarian', 'Non-Veg'
    preference: z.string().optional(), // 'Vegan', 'Non-Veg', 'Gluten-Free', 'Keto', etc.
    allergy: z.string().optional(), // 'Nuts (Severe)', 'Shellfish', 'Dairy', 'None', etc.
    guestCategory: z.string().optional(), // 'VIP', 'Speaker', 'Attendee', 'Family'
    eventId: z.string().uuid().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
    sortBy: z.enum(['name', 'mealPreference', 'allergies', 'createdAt']).optional().default('name'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});
