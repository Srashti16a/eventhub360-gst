const Joi = require('joi');

/**
 * Validation schemas for Badge Templates
 */
const badgeTemplateCreateSchema = Joi.object({
    event_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Event ID is required',
        'number.base': 'Event ID must be a valid number'
    }),
    template_name: Joi.string().min(2).max(255).required().messages({
        'any.required': 'Template name is required',
        'string.empty': 'Template name cannot be empty'
    }),
    orientation: Joi.string().valid('Portrait', 'Landscape').default('Portrait'),
    card_size: Joi.string().valid('4x6', '3x4', 'Standard').default('4x6'),
    include_qr: Joi.boolean().default(true),
    include_logo: Joi.boolean().default(true),
    show_job_title: Joi.boolean().default(false),
    center_alignment: Joi.boolean().default(true)
});

const badgeTemplateUpdateSchema = Joi.object({
    template_name: Joi.string().min(2).max(255).optional(),
    orientation: Joi.string().valid('Portrait', 'Landscape').optional(),
    card_size: Joi.string().valid('4x6', '3x4', 'Standard').optional(),
    include_qr: Joi.boolean().optional(),
    include_logo: Joi.boolean().optional(),
    show_job_title: Joi.boolean().optional(),
    center_alignment: Joi.boolean().optional()
});

/**
 * Validation schemas for Badge Printers
 */
const badgePrinterCreateSchema = Joi.object({
    printer_name: Joi.string().min(2).max(255).required().messages({
        'any.required': 'Printer name is required'
    }),
    printer_code: Joi.string().min(2).max(100).required().messages({
        'any.required': 'Printer code is required'
    }),
    location: Joi.string().max(255).allow(null, '').optional(),
    status: Joi.string().valid('Online', 'Offline', 'Paper Low', 'Maintenance').default('Online'),
    paper_status: Joi.string().valid('OK', 'Low', 'Empty').default('OK')
});

const badgePrinterUpdateSchema = Joi.object({
    printer_name: Joi.string().min(2).max(255).optional(),
    location: Joi.string().max(255).allow(null, '').optional(),
    status: Joi.string().valid('Online', 'Offline', 'Paper Low', 'Maintenance').optional(),
    paper_status: Joi.string().valid('OK', 'Low', 'Empty').optional()
});

/**
 * Validation schema for trigger single print jobs
 */
const badgePrintJobCreateSchema = Joi.object({
    guest_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Guest ID is required'
    }),
    template_id: Joi.number().integer().positive().optional().allow(null),
    printer_id: Joi.number().integer().positive().optional().allow(null),
    priority: Joi.number().integer().min(1).default(1)
});

/**
 * Validation schema for batch print jobs trigger
 */
const badgePrintBatchCreateSchema = Joi.object({
    event_id: Joi.number().integer().positive().required(),
    batch_name: Joi.string().min(2).max(255).required(),
    guest_ids: Joi.array().items(Joi.number().integer().positive()).required().min(1).messages({
        'array.min': 'At least one Guest ID must be supplied for batch printing'
    }),
    template_id: Joi.number().integer().positive().optional().allow(null),
    printer_id: Joi.number().integer().positive().optional().allow(null)
});

/**
 * Validation schemas for settings configuration
 */
const badgeConfigurationSaveSchema = Joi.object({
    event_id: Joi.number().integer().positive().required(),
    default_template_id: Joi.number().integer().positive().allow(null).optional(),
    auto_generate_qr: Joi.boolean().default(true),
    auto_print_on_checkin: Joi.boolean().default(false)
});

/**
 * Validation schemas for active queue actions
 */
const printQueueReorderSchema = Joi.object({
    queue_item_ids: Joi.array().items(Joi.number().integer().positive()).required().messages({
        'any.required': 'A list of queue item IDs in new order is required'
    })
});

/**
 * Query schema for retrieving lists with pagination/filters
 */
const badgePrintingQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(100).allow(null, '').optional(),
    status: Joi.string().max(50).allow(null, '').optional()
});

module.exports = {
    badgeTemplateCreateSchema,
    badgeTemplateUpdateSchema,
    badgePrinterCreateSchema,
    badgePrinterUpdateSchema,
    badgePrintJobCreateSchema,
    badgePrintBatchCreateSchema,
    badgeConfigurationSaveSchema,
    printQueueReorderSchema,
    badgePrintingQuerySchema
};
