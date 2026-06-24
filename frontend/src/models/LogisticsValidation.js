const Joi = require('joi');

/**
 * Common query filtering for vehicles listing
 */
const vehicleQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('On Route', 'Staged', 'Maintenance', 'Available').optional(),
    vehicle_type: Joi.string().max(100).optional(),
    search: Joi.string().max(100).allow(null, '').optional()
});

/**
 * Query schema for the Guest Queue sidebar panel
 */
const guestQueueQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(100).allow(null, '').optional(),
    category: Joi.string().valid('VIP', 'Speaker', 'Staff', 'Attendee').optional(),
    priority_level: Joi.string().valid('Critical', 'High', 'Standard', 'Low').optional(),
    is_waitlisted: Joi.boolean().optional()
});

/**
 * Assign Guest to Vehicle payload validation schema
 */
const assignRequestSchema = Joi.object({
    guest_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Guest ID is required to allocate transport'
    }),
    vehicle_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Vehicle ID is required to allocate transport'
    }),
    allocation_status: Joi.string().valid('Assigned', 'Reserved', 'Checked In', 'Checked Out').default('Assigned')
});

/**
 * Reassign Guest to another vehicle payload validation schema
 */
const reassignRequestSchema = Joi.object({
    allocation_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Allocation ID is required for reassignment'
    }),
    target_vehicle_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Target Vehicle ID is required for reassignment'
    }),
    allocation_status: Joi.string().valid('Assigned', 'Reserved', 'Checked In', 'Checked Out').optional()
});

/**
 * Conflicts list query validation schema
 */
const conflictQuerySchema = Joi.object({
    status: Joi.string().valid('Unresolved', 'Resolved').default('Unresolved'),
    conflict_type: Joi.string().valid('Capacity Conflict', 'Timing Conflict', 'Route Conflict').optional()
});

/**
 * Route Optimization validation schema
 */
const optimizeRoutesSchema = Joi.object({
    vehicle_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
        'array.min': 'Select at least one vehicle to optimize routes'
    }),
    optimization_rule: Joi.string().valid('Shortest Time', 'Least Distance', 'Balanced Capacity').default('Shortest Time')
});

/**
 * Waitlist list query validation schema
 */
const waitlistQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    priority_level: Joi.string().valid('Critical', 'High', 'Standard', 'Low').optional()
});

/**
 * Waitlist Report generation validation schema
 */
const waitlistReportSchema = Joi.object({
    format: Joi.string().valid('CSV', 'PDF').default('CSV'),
    priority_level: Joi.string().valid('Critical', 'High', 'Standard', 'Low').allow(null, '').optional()
});

module.exports = {
    vehicleQuerySchema,
    guestQueueQuerySchema,
    assignRequestSchema,
    reassignRequestSchema,
    conflictQuerySchema,
    optimizeRoutesSchema,
    waitlistQuerySchema,
    waitlistReportSchema
};
