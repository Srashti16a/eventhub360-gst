const Joi = require('joi');

const fleetAssignmentCreateSchema = Joi.object({
    vehicle_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Vehicle ID is required for assignments'
    }),
    driver_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Driver ID is required for assignments'
    }),
    event_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Event ID is required for assignments'
    }),
    status: Joi.string().valid('Active', 'Completed', 'Cancelled').default('Active')
});

const fleetAssignmentUpdateSchema = Joi.object({
    status: Joi.string().valid('Active', 'Completed', 'Cancelled').required().messages({
        'any.required': 'Assignment status is required for updates'
    })
});

const transportRouteCreateSchema = Joi.object({
    route_name: Joi.string().min(2).max(255).required().messages({
        'any.required': 'Route name is required'
    }),
    start_location: Joi.string().min(2).max(255).required().messages({
        'any.required': 'Start location is required'
    }),
    end_location: Joi.string().min(2).max(255).required().messages({
        'any.required': 'End location is required'
    }),
    distance_km: Joi.number().min(0.00).required().messages({
        'any.required': 'Distance in km is required'
    }),
    duration_mins: Joi.number().integer().min(0).required().messages({
        'any.required': 'Estimated duration in minutes is required'
    })
});

const scheduleCreateSchema = Joi.object({
    guest_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Guest ID is required'
    }),
    event_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Event ID is required'
    }),
    transfer_type: Joi.string().valid('Airport Pickup', 'Airport Dropoff', 'Hotel Transfer', 'VIP Transport', 'Other').required().messages({
        'any.required': 'Transfer type is required'
    }),
    pickup_location: Joi.string().min(2).max(255).required().messages({
        'any.required': 'Pickup location is required'
    }),
    dropoff_location: Joi.string().min(2).max(255).required().messages({
        'any.required': 'Dropoff location is required'
    }),
    scheduled_time: Joi.date().iso().required().messages({
        'any.required': 'Scheduled time is required',
        'date.format': 'Scheduled time must be a valid ISO-8601 date string'
    }),
    route_id: Joi.number().integer().positive().allow(null).optional(),
    vehicle_id: Joi.number().integer().positive().allow(null).optional(),
    driver_id: Joi.number().integer().positive().allow(null).optional(),
    status: Joi.string().valid('Scheduled', 'In Transit', 'Completed', 'Cancelled').default('Scheduled')
});

const scheduleUpdateSchema = Joi.object({
    route_id: Joi.number().integer().positive().allow(null).optional(),
    vehicle_id: Joi.number().integer().positive().allow(null).optional(),
    driver_id: Joi.number().integer().positive().allow(null).optional(),
    status: Joi.string().valid('Scheduled', 'In Transit', 'Completed', 'Cancelled').optional()
}).min(1);

const maintenanceCreateSchema = Joi.object({
    vehicle_id: Joi.number().integer().positive().required().messages({
        'any.required': 'Vehicle ID is required'
    }),
    maintenance_type: Joi.string().valid('Oil Change', 'Tire Rotation', 'Engine Repair', 'Fuel Warning', 'Routine Inspection', 'Other').required().messages({
        'any.required': 'Maintenance type is required'
    }),
    description: Joi.string().max(1000).allow(null, '').optional(),
    scheduled_date: Joi.date().raw().required().messages({
        'any.required': 'Scheduled date is required'
    }),
    completed_date: Joi.date().raw().allow(null).optional(),
    status: Joi.string().valid('Scheduled', 'In Progress', 'Completed', 'Cancelled').default('Scheduled'),
    cost: Joi.number().min(0.00).default(0.00)
});

const maintenanceUpdateSchema = Joi.object({
    completed_date: Joi.date().raw().allow(null).optional(),
    status: Joi.string().valid('Scheduled', 'In Progress', 'Completed', 'Cancelled').optional(),
    cost: Joi.number().min(0.00).optional(),
    description: Joi.string().max(1000).allow(null, '').optional()
}).min(1);

const driverStatusUpdateSchema = Joi.object({
    status: Joi.string().valid('Available', 'Active', 'Off Duty', 'Resting', 'On Break', 'On-Break', 'Offline').required().messages({
        'any.required': 'Driver status is required'
    })
});

const queryTransportationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(255).allow(null, '').optional()
});

module.exports = {
    fleetAssignmentCreateSchema,
    fleetAssignmentUpdateSchema,
    transportRouteCreateSchema,
    scheduleCreateSchema,
    scheduleUpdateSchema,
    maintenanceCreateSchema,
    maintenanceUpdateSchema,
    driverStatusUpdateSchema,
    queryTransportationSchema
};
