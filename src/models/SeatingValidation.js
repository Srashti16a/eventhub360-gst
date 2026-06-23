const Joi = require('joi');

/**
 * Seating Dashboard Analytics query validation
 */
const dashboardQuerySchema = Joi.object({
    event_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Event ID is required to fetch seating dashboard analytics'
    })
});

/**
 * Seating Layout query validation
 */
const layoutQuerySchema = Joi.object({
    event_id: Joi.number().integer().positive().required(),
    layout_id: Joi.number().integer().positive().optional()
});

/**
 * Table Creation Validation Schema
 */
const tableCreateSchema = Joi.object({
    layout_id: Joi.number().integer().positive().required(),
    zone_id: Joi.number().integer().positive().allow(null).optional(),
    table_number: Joi.string().max(50).required().messages({
        'any.required': 'Table number is required'
    }),
    shape: Joi.string().valid('Round', 'Square', 'Rectangle', 'Long').required(),
    capacity: Joi.number().integer().positive().min(1).max(20).required(),
    is_vip: Joi.boolean().default(false),
    x_coordinate: Joi.number().default(0.00),
    y_coordinate: Joi.number().default(0.00),
    rotation: Joi.number().min(0.00).max(359.99).default(0.00),
    width: Joi.number().positive().allow(null).optional(),
    height: Joi.number().positive().allow(null).optional()
});

/**
 * Table Modification Validation Schema
 */
const tableUpdateSchema = Joi.object({
    zone_id: Joi.number().integer().positive().allow(null).optional(),
    table_number: Joi.string().max(50).optional(),
    shape: Joi.string().valid('Round', 'Square', 'Rectangle', 'Long').optional(),
    capacity: Joi.number().integer().positive().min(1).max(20).optional(),
    is_vip: Joi.boolean().optional(),
    x_coordinate: Joi.number().optional(),
    y_coordinate: Joi.number().optional(),
    rotation: Joi.number().min(0.00).max(359.99).optional(),
    width: Joi.number().positive().allow(null).optional(),
    height: Joi.number().positive().allow(null).optional()
});

/**
 * Drag and Drop Bulk Save positions schema
 */
const dragAndDropTableItem = Joi.object({
    table_id: Joi.number().integer().positive().required(),
    x_coordinate: Joi.number().required(),
    y_coordinate: Joi.number().required(),
    rotation: Joi.number().min(0.00).max(359.99).optional()
});

const dragAndDropBulkSaveSchema = Joi.object({
    tables: Joi.array().items(dragAndDropTableItem).min(1).required().messages({
        'array.min': 'Provide at least one table reposition'
    })
});

/**
 * Guest Seat Assignment validation schema
 */
const seatAssignmentSchema = Joi.object({
    guest_id: Joi.number().integer().positive().required(),
    table_id: Joi.number().integer().positive().required(),
    seat_id: Joi.number().integer().positive().allow(null).optional()
});

/**
 * Zone management schemas
 */
const zoneCreateSchema = Joi.object({
    layout_id: Joi.number().integer().positive().required(),
    name: Joi.string().max(100).required(),
    color_code: Joi.string().regex(/^#[A-Fa-f0-9]{6}$/).default('#E2E8F0').messages({
        'string.pattern.base': 'Color code must be a valid 6-character hex color (e.g. #FF5733)'
    })
});

/**
 * Layout general actions validation schema
 */
const layoutSaveSchema = Joi.object({
    name: Joi.string().max(255).optional(),
    status: Joi.string().valid('Draft', 'Saved', 'Finalized').optional()
});

const layoutVersionSchema = Joi.object({
    target_layout_id: Joi.number().integer().positive().required(),
    new_version_name: Joi.string().max(255).required()
});

module.exports = {
    dashboardQuerySchema,
    layoutQuerySchema,
    tableCreateSchema,
    tableUpdateSchema,
    dragAndDropBulkSaveSchema,
    seatAssignmentSchema,
    zoneCreateSchema,
    layoutSaveSchema,
    layoutVersionSchema
};
