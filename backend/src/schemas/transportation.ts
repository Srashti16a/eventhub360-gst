import { z } from 'zod';

export const createAssignmentSchema = z.object({
  body: z.object({
    vehicleId: z.string({ required_error: 'vehicleId is required' }).uuid('Invalid vehicle ID'),
    driverId: z.string({ required_error: 'driverId is required' }).uuid('Invalid driver ID'),
    eventId: z.string({ required_error: 'eventId is required' }).uuid('Invalid event ID'),
  }),
});

export const deleteAssignmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid assignment ID in path'),
  }),
});

export const createRouteSchema = z.object({
  body: z.object({
    routeName: z.string({ required_error: 'Route name is required' }).min(1),
    startLocation: z.string({ required_error: 'Start location is required' }).min(1),
    endLocation: z.string({ required_error: 'End location is required' }).min(1),
    distanceKm: z.number({ required_error: 'Distance is required' }).nonnegative(),
    durationMins: z.number({ required_error: 'Duration is required' }).int().positive(),
  }),
});

export const optimizeRouteSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid route ID in path'),
  }),
});

export const createTransferSchema = z.object({
  body: z.object({
    guestId: z.string({ required_error: 'guestId is required' }).uuid('Invalid guest ID'),
    eventId: z.string({ required_error: 'eventId is required' }).uuid('Invalid event ID'),
    transferType: z.string({ required_error: 'transferType is required' }).min(1),
    pickupLocation: z.string({ required_error: 'pickupLocation is required' }).min(1),
    dropoffLocation: z.string({ required_error: 'dropoffLocation is required' }).min(1),
    scheduledTime: z.string({ required_error: 'scheduledTime is required' }).transform((val) => new Date(val)),
    routeId: z.string().uuid().nullable().optional(),
    vehicleId: z.string().uuid().nullable().optional(),
    driverId: z.string().uuid().nullable().optional(),
    status: z.enum(['Scheduled', 'In Transit', 'Completed', 'Cancelled']).optional().default('Scheduled'),
  }),
});

export const getTransferSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid transfer ID in path'),
  }),
});

export const updateTransferSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid transfer ID in path'),
  }),
  body: z.object({
    pickupLocation: z.string().optional(),
    dropoffLocation: z.string().optional(),
    scheduledTime: z.string().transform((val) => new Date(val)).optional(),
    routeId: z.string().uuid().nullable().optional(),
    vehicleId: z.string().uuid().nullable().optional(),
    driverId: z.string().uuid().nullable().optional(),
    status: z.enum(['Scheduled', 'In Transit', 'Completed', 'Cancelled']).optional(),
  }),
});

export const deleteTransferSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid transfer ID in path'),
  }),
});

export const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ID in path'),
  }),
  body: z.object({
    status: z.string({ required_error: 'Status is required' }).min(1),
  }),
});

export const createMaintenanceSchema = z.object({
  body: z.object({
    vehicleId: z.string({ required_error: 'vehicleId is required' }).uuid('Invalid vehicle ID'),
    maintenanceType: z.string({ required_error: 'maintenanceType is required' }).min(1),
    description: z.string().nullable().optional(),
    scheduledDate: z.string({ required_error: 'scheduledDate is required' }).transform((val) => new Date(val)),
    cost: z.number().nonnegative().optional().default(0),
  }),
});

export const updateMaintenanceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid maintenance ID in path'),
  }),
  body: z.object({
    description: z.string().optional(),
    completedDate: z.string().transform((val) => new Date(val)).nullable().optional(),
    status: z.enum(['Scheduled', 'In Progress', 'Completed', 'Cancelled']).optional(),
    cost: z.number().nonnegative().optional(),
  }),
});
