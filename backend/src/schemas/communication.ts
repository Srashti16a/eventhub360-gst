import { z } from 'zod';

export const queryLogsSchema = z.object({
  query: z.object({
    channel: z.enum(['EMAIL', 'WHATSAPP', 'SMS']).optional(),
    status: z.enum(['DELIVERED', 'SENT', 'FAILED', 'PENDING', 'READ']).optional(),
    startDate: z.string().datetime({ message: 'Invalid start date format' }).optional(),
    endDate: z.string().datetime({ message: 'Invalid end date format' }).optional(),
    search: z.string().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
    sortBy: z.enum(['createdAt', 'latencyMs']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const rerouteSchema = z.object({
  body: z.object({
    channel: z.enum(['EMAIL', 'WHATSAPP', 'SMS'], { required_error: 'channel is required' }),
  }),
});
