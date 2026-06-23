const Joi = require('joi');

/**
 * Validation schema for Campaign Creation
 */
const campaignCreateSchema = Joi.object({
    event_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Event ID is required'
    }),
    name: Joi.string().min(2).max(255).required().messages({
        'any.required': 'Campaign name is required',
        'string.empty': 'Campaign name cannot be empty'
    }),
    channel: Joi.string().valid('Email', 'WhatsApp', 'SMS').required().messages({
        'any.only': 'Channel must be either Email, WhatsApp or SMS',
        'any.required': 'Campaign channel is required'
    }),
    template_id: Joi.number().integer().positive().allow(null).optional(),
    segment_id: Joi.number().integer().positive().allow(null).optional(),
    status: Joi.string().valid('Draft', 'Published', 'Scheduled', 'Sending', 'Completed').default('Draft')
});

/**
 * Validation schema for Campaign Update
 */
const campaignUpdateSchema = Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    template_id: Joi.number().integer().positive().allow(null).optional(),
    segment_id: Joi.number().integer().positive().allow(null).optional(),
    status: Joi.string().valid('Draft', 'Published', 'Scheduled', 'Sending', 'Completed').optional()
});

/**
 * Validation schema for Campaign Scheduling
 */
const broadcastScheduleSchema = Joi.object({
    scheduled_time: Joi.date().iso().greater('now').required().messages({
        'any.required': 'Scheduled broadcast time is required',
        'date.greater': 'Scheduled broadcast time must be in the future'
    })
});

/**
 * Validation schema for Tracking Interaction Webhooks
 */
const trackingWebhookSchema = Joi.object({
    recipient_id: Joi.number().integer().positive().required(),
    action: Joi.string().valid('Opened', 'Clicked').required()
});

/**
 * Campaign Query Parameters validation
 */
const campaignQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(100).allow(null, '').optional(),
    channel: Joi.string().valid('Email', 'WhatsApp', 'SMS').optional(),
    status: Joi.string().valid('Draft', 'Published', 'Scheduled', 'Sending', 'Completed').optional()
});

module.exports = {
    campaignCreateSchema,
    campaignUpdateSchema,
    broadcastScheduleSchema,
    trackingWebhookSchema,
    campaignQuerySchema
};
