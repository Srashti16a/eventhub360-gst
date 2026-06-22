const Joi = require('joi');

/**
 * Floor filtering schema
 */
const floorQuerySchema = Joi.object({
    hotel_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Hotel ID is required to list floor plans'
    })
});

/**
 * Single Room Allocation validation schemas
 */
const roomAllocationCreateSchema = Joi.object({
    room_id: Joi.number().integer().positive().required(),
    guest_id: Joi.number().integer().positive().required(),
    reservation_id: Joi.number().integer().positive().allow(null).optional(),
    allocation_status: Joi.string().valid('Assigned', 'Reserved', 'Checked In', 'Checked Out').default('Assigned')
});

const roomAllocationUpdateSchema = Joi.object({
    room_id: Joi.number().integer().positive().optional(),
    allocation_status: Joi.string().valid('Assigned', 'Reserved', 'Checked In', 'Checked Out').optional()
});

/**
 * Bulk Room Allocation saving validation schema
 */
const roomAllocationBulkSaveSchema = Joi.object({
    allocations: Joi.array().items(
        Joi.object({
            room_id: Joi.number().integer().positive().required(),
            guest_id: Joi.number().integer().positive().required(),
            reservation_id: Joi.number().integer().positive().allow(null).optional(),
            allocation_status: Joi.string().valid('Assigned', 'Reserved', 'Checked In', 'Checked Out').default('Assigned')
        })
    ).min(1).required().messages({
        'array.min': 'Provide at least one allocation to save'
    })
});

/**
 * Auto assignment trigger options validation schema
 */
const autoAssignSchema = Joi.object({
    hotel_id: Joi.number().integer().positive().required(),
    rules: Joi.object({
        vip_preferred_floors: Joi.array().items(Joi.number().integer()).optional(),
        auto_resolve_conflicts: Joi.boolean().default(false),
        match_guest_requests: Joi.boolean().default(true)
    }).default({})
});

/**
 * Guest Request validation schemas
 */
const guestRequestCreateSchema = Joi.object({
    guest_id: Joi.number().integer().positive().required(),
    request_type: Joi.string().valid('High Floor', 'VIP Placement', 'King Bed', 'Suite Upgrade', 'Other').required().messages({
        'any.only': 'Request type must be one of: High Floor, VIP Placement, King Bed, Suite Upgrade, Other'
    }),
    request_value: Joi.string().max(255).allow(null, '').optional()
});

const guestRequestUpdateSchema = Joi.object({
    request_type: Joi.string().valid('High Floor', 'VIP Placement', 'King Bed', 'Suite Upgrade', 'Other').optional(),
    request_value: Joi.string().max(255).allow(null, '').optional()
});

/**
 * Common list filtering schema
 */
const roomAllocationQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(100).allow(null, ''),
    hotel_id: Joi.number().integer().positive().optional(),
    resolved: Joi.boolean().optional() // for conflicts filter
});

module.exports = {
    floorQuerySchema,
    roomAllocationCreateSchema,
    roomAllocationUpdateSchema,
    roomAllocationBulkSaveSchema,
    autoAssignSchema,
    guestRequestCreateSchema,
    guestRequestUpdateSchema,
    roomAllocationQuerySchema
};
