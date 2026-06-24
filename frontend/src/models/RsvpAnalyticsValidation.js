const Joi = require('joi');

/**
 * Validates route path parameters (e.g. eventId)
 */
const rsvpParamsSchema = Joi.object({
    eventId: Joi.number().integer().min(1).required().messages({
        'number.base': 'Event ID must be a valid integer',
        'any.required': 'Event ID parameter is required'
    })
});

/**
 * Validates query parameters for paginated guest responses list
 */
const rsvpResponsesQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    category: Joi.string().max(100).optional(),
    search: Joi.string().max(100).optional()
});

/**
 * Validates query parameters for activity timeline feed log
 */
const rsvpTimelineQuerySchema = Joi.object({
    limit: Joi.number().integer().min(1).max(50).default(5)
});

/**
 * Validates query parameters for response trends graph
 */
const rsvpTrendsQuerySchema = Joi.object({
    range: Joi.string().valid('weekly', 'monthly').default('weekly')
});

module.exports = {
    rsvpParamsSchema,
    rsvpResponsesQuerySchema,
    rsvpTimelineQuerySchema,
    rsvpTrendsQuerySchema
};
