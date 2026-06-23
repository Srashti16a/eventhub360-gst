const Joi = require('joi');

/**
 * Validation schema for queries
 */
const queryLogsSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(255).allow(null, '').optional(),
    channel: Joi.string().valid('Email', 'WhatsApp', 'SMS').optional(),
    status: Joi.string().valid('Pending', 'Sent', 'Delivered', 'Failed', 'Read').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
});

/**
 * Webhook status tracking validation
 */
const webhookTrackingSchema = Joi.object({
    log_id: Joi.number().integer().positive().required(),
    status: Joi.string().valid('Sent', 'Delivered', 'Failed', 'Read').required(),
    delivery_result: Joi.string().max(255).optional(),
    gateway_name: Joi.string().max(100).optional(),
    error_code: Joi.string().max(50).optional(),
    error_message: Joi.string().optional(),
    delivered_at: Joi.date().iso().optional(),
    read_at: Joi.date().iso().optional(),
    sent_at: Joi.date().iso().optional()
});

/**
 * Retry action validation
 */
const logRetrySchema = Joi.object({
    log_id: Joi.number().integer().positive().required(),
    retry_count: Joi.number().integer().min(1).required(),
    status: Joi.string().valid('Retrying', 'Success', 'Failed').required(),
    gateway_response: Joi.string().optional()
});

/**
 * Traffic Rerouting validation
 */
const trafficRerouteSchema = Joi.object({
    channel: Joi.string().valid('Email', 'WhatsApp', 'SMS').required(),
    from_gateway: Joi.string().max(100).required(),
    to_gateway: Joi.string().max(100).required(),
    reroute_reason: Joi.string().max(1000).allow(null, '').optional()
});

/**
 * Automation Alert Status update
 */
const alertStatusUpdateSchema = Joi.object({
    status: Joi.string().valid('Active', 'Resolved', 'Dismissed').required()
});

module.exports = {
    queryLogsSchema,
    webhookTrackingSchema,
    logRetrySchema,
    trafficRerouteSchema,
    alertStatusUpdateSchema
};
