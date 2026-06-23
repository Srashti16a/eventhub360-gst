const express = require('express');
const router = express.Router();
const RsvpAnalyticsController = require('../controllers/RsvpAnalyticsController');
const {
    rsvpParamsSchema,
    rsvpResponsesQuerySchema,
    rsvpTimelineQuerySchema,
    rsvpTrendsQuerySchema
} = require('../models/RsvpAnalyticsValidation');

/**
 * Request validation middleware helper
 * @param {Object} schema - Joi validation schema
 * @param {'body' | 'query' | 'params'} [property] - Target data to validate
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], { abortEarly: false });
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ success: false, error: errorMessage });
        }
        req[property] = value;
        next();
    };
};

// RSVP Analytics Dashboard Endpoints
router.get(
    '/:eventId/summary', 
    validate(rsvpParamsSchema, 'params'), 
    RsvpAnalyticsController.getSummary
);

router.get(
    '/:eventId/trends', 
    validate(rsvpParamsSchema, 'params'), 
    validate(rsvpTrendsQuerySchema, 'query'), 
    RsvpAnalyticsController.getTrends
);

router.get(
    '/:eventId/categories', 
    validate(rsvpParamsSchema, 'params'), 
    RsvpAnalyticsController.getCategories
);

router.get(
    '/:eventId/timeline', 
    validate(rsvpParamsSchema, 'params'), 
    validate(rsvpTimelineQuerySchema, 'query'), 
    RsvpAnalyticsController.getTimeline
);

router.get(
    '/:eventId/responses', 
    validate(rsvpParamsSchema, 'params'), 
    validate(rsvpResponsesQuerySchema, 'query'), 
    RsvpAnalyticsController.getResponses
);

module.exports = router;
