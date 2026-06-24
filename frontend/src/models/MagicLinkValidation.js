const Joi = require('joi');

/**
 * Validation schema for Magic Link Creation payload
 */
const magicLinkCreateSchema = Joi.object({
    guest_id: Joi.number().integer().positive().required().messages({
        'number.base': 'Guest ID must be a number',
        'number.integer': 'Guest ID must be an integer',
        'any.required': 'Guest selection is required to generate a link'
    }),
    expiration_type: Joi.string().valid('24 Hours', '7 Days', '30 Days', 'No Expiration').default('7 Days').messages({
        'any.only': 'Expiration setting must be one of: 24 Hours, 7 Days, 30 Days, No Expiration'
    }),
    single_use: Joi.boolean().default(false),
    ip_lockdown: Joi.boolean().default(false),
    allowed_ip: Joi.string().ip({ version: ['ipv4', 'ipv6'] }).allow(null, '').messages({
        'string.ip': 'Allowed IP must be a valid IPv4 or IPv6 address'
    })
});

/**
 * Validation schema for Bulk Magic Link Generation payload
 */
const magicLinkBulkCreateSchema = Joi.object({
    guest_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
        'array.base': 'Guest IDs list must be an array',
        'array.min': 'Select at least one guest for bulk generation',
        'any.required': 'Guest selection array is required'
    }),
    expiration_type: Joi.string().valid('24 Hours', '7 Days', '30 Days', 'No Expiration').default('7 Days'),
    single_use: Joi.boolean().default(false),
    ip_lockdown: Joi.boolean().default(false),
    allowed_ip: Joi.string().ip({ version: ['ipv4', 'ipv6'] }).allow(null, '')
});

/**
 * Validation schema for Magic Link Query parameters
 */
const magicLinkQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('Active', 'Expiring Soon', 'Expired', 'Revoked', 'Used').optional(),
    category: Joi.string().max(100).optional(),
    search: Joi.string().max(100).optional()
});

/**
 * Validation schema for Magic Link Distribution payload
 */
const magicLinkDistributeSchema = Joi.object({
    channel: Joi.string().valid('EMAIL', 'WHATSAPP').required().messages({
        'any.only': 'Distribution channel must be either EMAIL or WHATSAPP',
        'any.required': 'Distribution channel is required'
    })
});

module.exports = {
    magicLinkCreateSchema,
    magicLinkBulkCreateSchema,
    magicLinkQuerySchema,
    magicLinkDistributeSchema
};
