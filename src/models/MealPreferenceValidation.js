const Joi = require('joi');

/**
 * Common dashboard query schema
 */
const dashboardQuerySchema = Joi.object({
    event_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Event ID is required to fetch dashboard metrics'
    })
});

/**
 * Guest Preference Log search & filter query schema
 */
const mealPreferenceQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(100).allow(null, '').optional(),
    dietary_type: Joi.string().valid('Vegan', 'Vegetarian', 'Non-Vegetarian', 'Gluten-Free', 'Keto', 'Custom').optional(),
    category: Joi.string().max(50).allow(null, '').optional(), // e.g. 'Speaker', 'VIP', 'Attendee'
    event_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Event ID is required to fetch preferences'
    })
});

/**
 * Upsert Guest Preferences Validation Schema
 */
const guestAllergyItemSchema = Joi.object({
    allergen_name: Joi.string().valid('Nuts', 'Shellfish', 'Dairy', 'Soy', 'Egg', 'Gluten', 'Other').required().messages({
        'any.only': 'Allergen must be one of: Nuts, Shellfish, Dairy, Soy, Egg, Gluten, Other'
    }),
    severity: Joi.string().valid('Mild', 'Moderate', 'Severe').default('Mild'),
    notes: Joi.string().max(255).allow(null, '').optional()
});

const mealPrefUpsertSchema = Joi.object({
    dietary_type: Joi.string().valid('Vegan', 'Vegetarian', 'Non-Vegetarian', 'Gluten-Free', 'Keto', 'Custom').required().messages({
        'any.required': 'Dietary type is required'
    }),
    custom_dietary_notes: Joi.string().max(1000).allow(null, '').optional(),
    special_requests: Joi.string().max(1000).allow(null, '').optional(),
    allergies: Joi.array().items(guestAllergyItemSchema).optional().default([])
});

/**
 * Menu Item management validation schemas
 */
const menuItemCreateSchema = Joi.object({
    name: Joi.string().max(255).required().messages({
        'any.required': 'Menu item name is required'
    }),
    description: Joi.string().max(1000).allow(null, '').optional(),
    dietary_category: Joi.string().valid('Vegan', 'Vegetarian', 'Non-Vegetarian', 'Gluten-Free', 'Keto', 'Custom').required(),
    allergens: Joi.array().items(Joi.string().valid('Nuts', 'Shellfish', 'Dairy', 'Soy', 'Egg', 'Gluten', 'Other')).optional().default([]),
    is_daily_special: Joi.boolean().default(false),
    price: Joi.number().precision(2).min(0).default(0.00),
    is_active: Joi.boolean().default(true),
    event_id: Joi.number().integer().positive().allow(null).optional()
});

const menuItemUpdateSchema = Joi.object({
    name: Joi.string().max(255).optional(),
    description: Joi.string().max(1000).allow(null, '').optional(),
    dietary_category: Joi.string().valid('Vegan', 'Vegetarian', 'Non-Vegetarian', 'Gluten-Free', 'Keto', 'Custom').optional(),
    allergens: Joi.array().items(Joi.string().valid('Nuts', 'Shellfish', 'Dairy', 'Soy', 'Egg', 'Gluten', 'Other')).optional(),
    is_daily_special: Joi.boolean().optional(),
    price: Joi.number().precision(2).min(0).optional(),
    is_active: Joi.boolean().optional(),
    event_id: Joi.number().integer().positive().allow(null).optional()
});

/**
 * Chef Schedule validation schema
 */
const chefScheduleUpdateSchema = Joi.object({
    prep_start_time: Joi.string().regex(/^(0[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/).optional().messages({
        'string.pattern.base': 'Prep start time must be in HH:MM AM/PM format (e.g. 06:00 AM)'
    }),
    inventory_status: Joi.string().valid('Adequate', 'Low', 'Critical').optional(),
    stock_alert_item: Joi.string().max(255).allow(null, '').optional(),
    special_request_count: Joi.number().integer().min(0).optional(),
    notes: Joi.string().max(1000).allow(null, '').optional()
});

/**
 * Recommendations validation schema
 */
const recommendationActionSchema = Joi.object({
    suggestion_id: Joi.number().integer().positive().required(),
    action: Joi.string().valid('Apply', 'Dismiss').required()
});

module.exports = {
    dashboardQuerySchema,
    mealPreferenceQuerySchema,
    mealPrefUpsertSchema,
    menuItemCreateSchema,
    menuItemUpdateSchema,
    chefScheduleUpdateSchema,
    recommendationActionSchema
};
