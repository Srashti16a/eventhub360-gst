import { z } from 'zod';

const CommunicationTypeEnum = z.enum(['EMAIL', 'WHATSAPP', 'SMS', 'PHONE_CALL']);
const CampaignStatusEnum = z.enum(['DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED']);
const CampaignTargetTypeEnum = z.enum(['GUEST_GROUP', 'VIP', 'SPEAKERS', 'CONFIRMED', 'PENDING', 'ALL_GUESTS']);

export const createCampaignSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).min(1, 'Title cannot be empty'),
    subject: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    channel: CommunicationTypeEnum,
    targetType: CampaignTargetTypeEnum,
    targetId: z.string().uuid('Invalid target ID format').optional().nullable(),
    eventId: z.string().uuid('Invalid event ID format').optional().nullable(),
    scheduledAt: z.string().optional().nullable().transform((val) => (val ? new Date(val) : null)),
    status: CampaignStatusEnum.optional().default('DRAFT'),
    createdBy: z.string().optional(),
  }),
});

export const updateCampaignSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid campaign ID in path'),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    subject: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    channel: CommunicationTypeEnum.optional(),
    targetType: CampaignTargetTypeEnum.optional(),
    targetId: z.string().uuid('Invalid target ID format').optional().nullable(),
    eventId: z.string().uuid('Invalid event ID format').optional().nullable(),
    scheduledAt: z.string().optional().nullable().transform((val) => (val ? new Date(val) : null)),
    status: CampaignStatusEnum.optional(),
    createdBy: z.string().optional(),
  }),
});

export const getCampaignSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid campaign ID in path'),
  }),
});

export const listCampaignsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.string().optional(),
    channel: z.string().optional(),
    event: z.string().optional(),
    startDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
    endDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
    sortBy: z.enum(['title', 'status', 'channel', 'createdAt']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});
