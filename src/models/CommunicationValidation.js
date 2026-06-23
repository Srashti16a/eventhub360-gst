const Joi = require('joi');

/**
 * Validation schema for Communication Templates
 */
const communicationTemplateCreateSchema = Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
        'any.required': 'Template name is required'
    }),
    channel: Joi.string().valid('Email', 'WhatsApp', 'SMS').required().messages({
        'any.required': 'Channel is required'
    }),
    subject: Joi.string().max(255).allow(null, '').optional().when('channel', {
        is: 'Email',
        then: Joi.required().messages({ 'any.required': 'Subject is required for Email templates' })
    }),
    content: Joi.string().min(5).required().messages({
        'any.required': 'Content body content is required'
    }),
    variables: Joi.array().items(Joi.string()).default([])
});

const communicationTemplateUpdateSchema = Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    subject: Joi.string().max(255).allow(null, '').optional(),
    content: Joi.string().min(5).optional(),
    variables: Joi.array().items(Joi.string()).optional(),
    is_active: Joi.boolean().optional()
});

/**
 * Validation schema for Audience Segments
 */
const audienceSegmentCreateSchema = Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
        'any.required': 'Segment name is required'
    }),
    description: Joi.string().max(1000).allow(null, '').optional(),
    rules: Joi.object().required().messages({
        'any.required': 'Segment validation criteria rules object is required'
    })
});

/**
 * Validation schema for Opt-Out Preferences
 */
const optOutPreferenceSaveSchema = Joi.object({
    guest_id: Joi.number().integer().positive().required(),
    channel: Joi.string().valid('Email', 'WhatsApp', 'SMS', 'All').required(),
    opt_out: Joi.boolean().default(true)
});

/**
 * Validation schema for Communication Logs Queries
 */
const communicationLogQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    channel: Joi.string().valid('Email', 'WhatsApp', 'SMS').optional(),
    status: Joi.string().valid('Sent', 'Delivered', 'Failed').optional()
});

module.exports = {
    communicationTemplateCreateSchema,
    communicationTemplateUpdateSchema,
    audienceSegmentCreateSchema,
    optOutPreferenceSaveSchema,
    communicationLogQuerySchema
};
