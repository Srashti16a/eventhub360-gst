const Joi = require('joi');

/**
 * Check-in dashboard analytics stats query schema
 */
const dashboardQuerySchema = Joi.object({
    event_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Event ID is required to fetch check-in dashboard analytics'
    })
});

/**
 * Check-in records list filter validation
 */
const checkInRecordQuerySchema = Joi.object({
    event_id: Joi.number().integer().positive().required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(100).allow(null, '').optional(),
    gate_id: Joi.number().integer().positive().optional(),
    status: Joi.string().valid('Success', 'Flagged', 'Failed').optional()
});

/**
 * Manual override guest check-in validation schema
 */
const manualCheckInSchema = Joi.object({
    event_id: Joi.number().integer().positive().required(),
    guest_id: Joi.number().integer().positive().required(),
    entry_gate_id: Joi.number().integer().positive().allow(null).optional(),
    status: Joi.string().valid('Success', 'Flagged', 'Failed').default('Success')
});

/**
 * QR gate scanner check-in validation schema
 */
const qrScanCheckInSchema = Joi.object({
    event_id: Joi.number().integer().positive().required(),
    pass_code: Joi.string().max(100).required(),
    entry_gate_id: Joi.number().integer().positive().allow(null).optional()
});

/**
 * Guest security flags schemas
 */
const guestFlagCreateSchema = Joi.object({
    guest_id: Joi.number().integer().positive().required(),
    event_id: Joi.number().integer().positive().required(),
    flag_reason: Joi.string().min(5).max(1000).required().messages({
        'any.required': 'Flag reason is required to flag a guest'
    })
});

const guestFlagReviewSchema = Joi.object({
    flag_status: Joi.string().valid('Reviewed', 'Resolved').required().messages({
        'any.required': 'Status update is required'
    })
});

/**
 * Gates configuration schemas
 */
const entryGateCreateSchema = Joi.object({
    event_id: Joi.number().integer().positive().required(),
    gate_name: Joi.string().max(100).required(),
    gate_type: Joi.string().valid('Main Entrance', 'VIP Gate', 'Staff Entrance', 'Ballroom Entrance').required(),
    capacity_limit: Joi.number().integer().positive().min(1).default(500)
});

const entryGateUpdateSchema = Joi.object({
    gate_name: Joi.string().max(100).optional(),
    gate_type: Joi.string().valid('Main Entrance', 'VIP Gate', 'Staff Entrance', 'Ballroom Entrance').optional(),
    capacity_limit: Joi.number().integer().positive().min(1).optional(),
    status: Joi.string().valid('Clear Flow', 'Queuing', 'Slow Lane', 'Fast Lane', 'Closed').optional()
});

/**
 * Staff shifts assignment validation schema
 */
const staffAssignSchema = Joi.object({
    user_id: Joi.number().integer().positive().required(),
    event_id: Joi.number().integer().positive().required(),
    entry_gate_id: Joi.number().integer().positive().required(),
    shift_start: Joi.date().iso().required(),
    shift_end: Joi.date().iso().required().greater(Joi.ref('shift_start')).messages({
        'date.greater': 'Shift end time must be after shift start time'
    })
});

module.exports = {
    dashboardQuerySchema,
    checkInRecordQuerySchema,
    manualCheckInSchema,
    qrScanCheckInSchema,
    guestFlagCreateSchema,
    guestFlagReviewSchema,
    entryGateCreateSchema,
    entryGateUpdateSchema,
    staffAssignSchema
};
