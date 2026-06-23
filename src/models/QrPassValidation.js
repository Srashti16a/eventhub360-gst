const Joi = require('joi');

/**
 * QR Dashboard statistics query validation
 */
const dashboardQuerySchema = Joi.object({
    event_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Event ID is required to fetch QR Pass metrics'
    })
});

/**
 * Registry logs search & pagination validation
 */
const registryQuerySchema = Joi.object({
    event_id: Joi.number().integer().positive().required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(100).allow(null, '').optional(),
    pass_type: Joi.string().valid('VIP', 'Attendee', 'Staff', 'Media', 'Vendor').optional(),
    status: Joi.string().valid('Active', 'Scanned', 'Revoked', 'Expired').optional()
});

/**
 * Pass Generation schemas
 */
const generatePassSchema = Joi.object({
    guest_id: Joi.number().integer().positive().required(),
    pass_type: Joi.string().valid('VIP', 'Attendee', 'Staff', 'Media', 'Vendor').required(),
    expires_at: Joi.date().iso().required().messages({
        'any.required': 'Pass expiration date is required'
    })
});

const generateBatchPassSchema = Joi.object({
    event_id: Joi.number().integer().positive().required(),
    pass_type: Joi.string().valid('VIP', 'Attendee', 'Staff', 'Media', 'Vendor').required(),
    guest_ids: Joi.array().items(Joi.number().integer().positive()).min(1).optional().messages({
        'array.min': 'Select at least one guest for batch pass generation'
    }),
    expires_at: Joi.date().iso().required()
});

/**
 * Pass Delivery validation schema
 */
const deliverPassSchema = Joi.object({
    channel: Joi.string().valid('Email', 'WhatsApp').required(),
    recipient_address: Joi.string().required().custom((value, helpers) => {
        const { channel } = helpers.state.ancestors[0];
        if (channel === 'Email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return helpers.message('Invalid email address format');
            }
        } else if (channel === 'WhatsApp') {
            // E.164 phone format check
            const phoneRegex = /^\+[1-9]\d{1,14}$/;
            if (!phoneRegex.test(value)) {
                return helpers.message('WhatsApp phone number must be in E.164 format (e.g. +15551234567)');
            }
        }
        return value;
    })
});

/**
 * Scan verification (Device scan tracking)
 */
const scanVerifySchema = Joi.object({
    pass_code: Joi.string().max(100).required().messages({
        'any.required': 'Scan verification requires a pass code'
    }),
    scan_location: Joi.string().max(255).required().messages({
        'any.required': 'Scan location is required'
    }),
    scanned_by: Joi.string().max(255).allow(null, '').optional()
});

/**
 * Scanner Device registry schema
 */
const registerScannerDeviceSchema = Joi.object({
    device_name: Joi.string().max(255).required().messages({
        'any.required': 'Device name is required to register a scanner'
    }),
    device_type: Joi.string().valid('Handheld', 'Automatic', 'Kiosk').default('Handheld')
});

/**
 * Pass revocation rules
 */
const revokePassSchema = Joi.object({
    revocation_reason: Joi.string().min(5).max(1000).required().messages({
        'any.required': 'Provide a reason for pass revocation',
        'string.min': 'Revocation reason must be at least 5 characters'
    })
});

/**
 * Export scan logs query schema
 */
const exportLogsQuerySchema = Joi.object({
    event_id: Joi.number().integer().positive().required(),
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().optional()
});

module.exports = {
    dashboardQuerySchema,
    registryQuerySchema,
    generatePassSchema,
    generateBatchPassSchema,
    deliverPassSchema,
    scanVerifySchema,
    registerScannerDeviceSchema,
    revokePassSchema,
    exportLogsQuerySchema
};
