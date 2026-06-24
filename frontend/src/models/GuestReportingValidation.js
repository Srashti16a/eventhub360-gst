const Joi = require('joi');

const templateColumnSchema = Joi.object({
    column_name: Joi.string().max(100).required(),
    display_label: Joi.string().max(100).required(),
    column_order: Joi.number().integer().min(0).default(0)
});

/**
 * Saved Report Template validation
 */
const templateCreateSchema = Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
        'any.required': 'Template name is required'
    }),
    description: Joi.string().max(1000).allow(null, '').optional(),
    group_by_column: Joi.string().max(100).allow(null, '').optional(),
    filter_criteria: Joi.object().default({}),
    sort_criteria: Joi.object().default({}),
    columns: Joi.array().items(templateColumnSchema).min(1).required().messages({
        'any.required': 'At least one column selection is required for a report template'
    })
});

/**
 * Report Generation metadata validation
 */
const reportCreateSchema = Joi.object({
    event_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Event ID context is required'
    }),
    name: Joi.string().min(2).max(255).required().messages({
        'any.required': 'Report name is required'
    }),
    description: Joi.string().max(1000).allow(null, '').optional(),
    template_id: Joi.number().integer().positive().allow(null).optional()
});

/**
 * Report Export History logging validation
 */
const exportHistorySchema = Joi.object({
    report_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Report ID is required for logging exports'
    }),
    export_type: Joi.string().valid('PDF', 'Excel').required(),
    file_url: Joi.string().uri().required()
});

/**
 * Queries parameters validation
 */
const queryReportsSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(255).allow(null, '').optional()
});

module.exports = {
    templateCreateSchema,
    reportCreateSchema,
    exportHistorySchema,
    queryReportsSchema
};
