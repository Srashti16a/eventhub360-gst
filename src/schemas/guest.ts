import { z } from 'zod';

export const createGuestSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(1, 'Name cannot be empty'),
    avatar: z.string().optional().default('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    phone: z.string({ required_error: 'Phone is required' }).min(5, 'Invalid phone number'),
    status: z.enum(['CONFIRMED', 'PENDING', 'DECLINED'], {
      required_error: 'Status is required',
      invalid_type_error: 'Status must be CONFIRMED, PENDING, or DECLINED',
    }),
    isVip: z.boolean().optional().default(false),
    isSpeaker: z.boolean().optional().default(false),
    isBridalParty: z.boolean().optional().default(false),
    isPrimaryGuest: z.boolean().optional().default(false),
    assignedHotelId: z.string().uuid().nullable().optional(),
    eventId: z.string({ required_error: 'eventId is required' }).uuid('Invalid Event ID'),
    tableId: z.string().uuid().nullable().optional(),
    seatNumber: z.number().int().positive().nullable().optional(),
  }),
});

export const updateGuestSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid guest ID in path'),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    avatar: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().min(5).optional(),
    status: z.enum(['CONFIRMED', 'PENDING', 'DECLINED']).optional(),
    isVip: z.boolean().optional(),
    isSpeaker: z.boolean().optional(),
    isBridalParty: z.boolean().optional(),
    isPrimaryGuest: z.boolean().optional(),
    assignedHotelId: z.string().uuid().nullable().optional(),
    eventId: z.string().uuid().optional(),
    tableId: z.string().uuid().nullable().optional(),
    seatNumber: z.number().int().positive().nullable().optional(),
  }),
});

export const getGuestSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid guest ID in path'),
  }),
});

export const listGuestsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    rsvpStatus: z.string().optional(),
    eventCategory: z.string().optional(),
    vipOnly: z.string().transform(val => val === 'true').optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
    sortBy: z.enum(['name', 'status', 'email', 'createdAt']).optional().default('name'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});
