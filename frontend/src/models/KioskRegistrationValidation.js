const Joi = require('joi');

/**
 * Kiosk Device Validation
 */
const kioskDeviceCreateSchema = Joi.object({
    device_name: Joi.string().min(2).max(255).required().messages({
        'any.required': 'Device name is required'
    }),
    device_code: Joi.string().min(2).max(100).required().messages({
        'any.required': 'Device code is required'
    }),
    location: Joi.string().max(255).allow(null, '').optional(),
    status: Joi.string().valid('Active', 'Offline', 'Maintenance', 'Assistance Required').default('Active')
});

const kioskDeviceUpdateSchema = Joi.object({
    device_name: Joi.string().min(2).max(255).optional(),
    location: Joi.string().max(255).allow(null, '').optional(),
    status: Joi.string().valid('Active', 'Offline', 'Maintenance', 'Assistance Required').optional()
});

/**
 * Session Validation
 */
const kioskSessionStartSchema = Joi.object({
    kiosk_device_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Kiosk Device ID is required'
    })
});

/**
 * Business Card Scan Validation
 */
const businessCardScanSchema = Joi.object({
    image_url: Joi.string().uri().required().messages({
        'any.required': 'Business card image URL is required',
        'string.uri': 'Business card image must be a valid URI location'
    }),
    guest_id: Joi.number().integer().positive().allow(null).optional()
});

/**
 * Photo Capture Validation
 */
const guestPhotoCaptureSchema = Joi.object({
    guest_id: Joi.number().integer().positive().required(),
    photo_url: Joi.string().uri().required(),
    capture_source: Joi.string().valid('Kiosk Camera', 'Upload').default('Kiosk Camera')
});

/**
 * Self-Service Registration Payload Validation
 */
const selfServiceRegisterSchema = Joi.object({
    session_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Active kiosk session ID is required'
    }),
    event_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Event ID is required'
    }),
    first_name: Joi.string().min(1).max(100).required().messages({
        'any.required': 'First name is required'
    }),
    last_name: Joi.string().min(1).max(100).required().messages({
        'any.required': 'Last name is required'
    }),
    email: Joi.string().email().required().messages({
        'any.required': 'Email address is required',
        'string.email': 'Email must be a valid address structure'
    }),
    company: Joi.string().max(255).required().messages({
        'any.required': 'Company / Organization name is required'
    }),
    job_title: Joi.string().max(255).required().messages({
        'any.required': 'Job title is required'
    }),
    phone: Joi.string().max(50).required().messages({
        'any.required': 'Phone number is required'
    }),
    category: Joi.string().valid('VIP', 'Attendee', 'Staff', 'Speaker').default('Attendee'),
    photo_url: Joi.string().uri().allow(null, '').optional(),
    card_scan_id: Joi.number().integer().positive().allow(null).optional()
});

/**
 * Concierge Assist Paging Validation
 */
const conciergeAssistSchema = Joi.object({
    kiosk_device_id: Joi.number().integer().positive().required(),
    message: Joi.string().max(255).allow(null, '').optional()
});

/**
 * Language Settings Validation
 */
const kioskLanguageSchema = Joi.object({
    language_code: Joi.string().min(2).max(10).required(),
    language_name: Joi.string().min(2).max(100).required(),
    is_active: Joi.boolean().default(true)
});

/**
 * Queue Update Validation
 */
const queuePriorityUpdateSchema = Joi.object({
    priority: Joi.number().integer().min(1).required(),
    queue_status: Joi.string().valid('Pending', 'Approved', 'Printed', 'Failed').optional()
});

/**
 * Paginated Lists Query Parameters
 */
const kioskQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(100).allow(null, '').optional(),
    status: Joi.string().max(50).allow(null, '').optional()
});

module.exports = {
    kioskDeviceCreateSchema,
    kioskDeviceUpdateSchema,
    kioskSessionStartSchema,
    businessCardScanSchema,
    guestPhotoCaptureSchema,
    selfServiceRegisterSchema,
    conciergeAssistSchema,
    kioskLanguageSchema,
    queuePriorityUpdateSchema,
    kioskQuerySchema
};
