import { z } from 'zod';

export const scanQRSchema = z.object({
  body: z.object({
    qrData: z.string({ required_error: 'qrData (guest ID) is required' }).uuid('Invalid guest ID format'),
    entranceId: z.string({ required_error: 'entranceId is required' }).uuid('Invalid entrance ID format'),
    staffId: z.string().uuid('Invalid staff ID format').nullable().optional(),
  }),
});

export const manualCheckInSchema = z.object({
  body: z.object({
    guestId: z.string({ required_error: 'guestId is required' }).uuid('Invalid guest ID format'),
    entranceId: z.string({ required_error: 'entranceId is required' }).uuid('Invalid entrance ID format'),
    staffId: z.string().uuid('Invalid staff ID format').nullable().optional(),
  }),
});

export const listCheckInLogsSchema = z.object({
  query: z.object({
    eventId: z.string().uuid('Invalid event ID format').optional(),
    entranceId: z.string().uuid('Invalid entrance ID format').optional(),
    staffId: z.string().uuid('Invalid staff ID format').optional(),
    status: z.enum(['SUCCESS', 'FLAGGED']).optional(),
    vipCategory: z.enum(['PLATINUM', 'KEYNOTE', 'GOLD', 'ATTENDEE']).optional(),
    startDate: z.string().datetime({ message: 'Invalid start date format' }).optional(),
    endDate: z.string().datetime({ message: 'Invalid end date format' }).optional(),
    search: z.string().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
    sortBy: z.enum(['checkedInAt', 'status']).optional().default('checkedInAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});
