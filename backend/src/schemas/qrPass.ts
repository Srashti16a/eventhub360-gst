import { z } from 'zod';

const QRPassTypeEnum = z.enum(['VIP', 'ATTENDEE', 'STAFF', 'SPEAKER', 'VENDOR', 'MEDIA']);
const QRPassStatusEnum = z.enum(['ACTIVE', 'SCANNED', 'REVOKED', 'EXPIRED']);
const CommunicationTypeEnum = z.enum(['EMAIL', 'WHATSAPP', 'SMS', 'PHONE_CALL']);

export const createQRPassSchema = z.object({
  body: z.object({
    guestId: z.string({ required_error: 'guestId is required' }).uuid('Invalid guest ID format'),
    eventId: z.string({ required_error: 'eventId is required' }).uuid('Invalid event ID format'),
    passType: QRPassTypeEnum,
    expiresAt: z.string().optional().nullable().transform((val) => (val ? new Date(val) : null)),
    status: QRPassStatusEnum.optional().default('ACTIVE'),
    createdBy: z.string().optional(),
  }),
});

export const updateQRPassSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid QR Pass ID in path'),
  }),
  body: z.object({
    passType: QRPassTypeEnum.optional(),
    status: QRPassStatusEnum.optional(),
    expiresAt: z.string().optional().nullable().transform((val) => (val ? new Date(val) : null)),
  }),
});

export const getQRPassSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid QR Pass ID in path'),
  }),
});

export const listQRPassSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    passType: z.string().optional(),
    status: z.string().optional(),
    eventId: z.string().uuid('Invalid event ID').optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
    sortBy: z.enum(['createdAt', 'passNumber', 'status', 'passType', 'downloadCount']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const scanPassSchema = z.object({
  body: z.object({
    qrToken: z.string({ required_error: 'qrToken is required' }).uuid('Invalid QR token format'),
    scanLocation: z.string().optional().nullable(),
    scannerName: z.string().optional().nullable(),
    deviceId: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const bulkGenerateSchema = z.object({
  body: z.object({
    eventId: z.string({ required_error: 'eventId is required' }).uuid('Invalid event ID format'),
    target: z.enum(['EVENT', 'GROUP', 'VIP', 'SPEAKERS', 'STAFF', 'SELECTED_GUESTS']),
    targetId: z.string().uuid('Invalid target ID format').optional().nullable(),
    guestIds: z.array(z.string().uuid('Invalid guest ID format')).optional(),
    passType: QRPassTypeEnum.optional(),
  }),
});

export const bulkActionSchema = z.object({
  body: z.object({
    action: z.enum(['ACTIVATE', 'REVOKE', 'EXPIRE', 'DELETE', 'RESEND']),
    qrPassIds: z.array(z.string().uuid('Invalid QR Pass ID format')),
    channel: z.enum(['EMAIL', 'WHATSAPP']).optional(),
  }),
});

export const deliveryPassSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid QR Pass ID in path'),
  }),
  body: z.object({
    channel: z.enum(['EMAIL', 'WHATSAPP']),
  }),
});
