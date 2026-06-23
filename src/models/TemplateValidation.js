const Joi = require('joi');

/**
 * Validation schema for Template Creation payload
 */
const templateCreateSchema = Joi.object({
    name: Joi.string().min(3).max(255).required().messages({
        'string.empty': 'Template name is required',
        'string.min': 'Template name must be at least 3 characters long',
        'string.max': 'Template name cannot exceed 255 characters'
    }),
    channel: Joi.string().valid('EMAIL', 'WHATSAPP').required().messages({
        'any.only': 'Channel must be either EMAIL or WHATSAPP',
        'any.required': 'Channel selection is required'
    }),
    category: Joi.string().max(100).default('Invitation'),
    subject: Joi.string().max(255).allow(null, '').when('channel', {
        is: 'EMAIL',
        then: Joi.required().messages({
            'any.required': 'Subject is required for Email templates'
        }),
        otherwise: Joi.optional()
    }),
    content: Joi.object().required().messages({
        'any.required': 'Template content layout configuration is required'
    }),
    variables: Joi.array().items(Joi.string()).default([])
});

/**
 * Validation schema for Template Update payload
 */
const templateUpdateSchema = Joi.object({
    name: Joi.string().min(3).max(255).optional(),
    category: Joi.string().max(100).optional(),
    subject: Joi.string().max(255).allow(null, '').optional(),
    content: Joi.object().optional(),
    variables: Joi.array().items(Joi.string()).optional()
});

/**
 * Validation schema for Template Query string parameters
 */
const templateQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    channel: Joi.string().valid('EMAIL', 'WHATSAPP').optional(),
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED').optional(),
    category: Joi.string().max(100).optional(),
    search: Joi.string().max(100).optional()
});

module.exports = {
    templateCreateSchema,
    templateUpdateSchema,
    templateQuerySchema
};
