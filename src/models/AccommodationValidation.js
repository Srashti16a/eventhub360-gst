const Joi = require('joi');

/**
 * Common pagination and query schema
 */
const accommodationQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(100).allow(null, ''),
    hotel_id: Joi.number().integer().positive().optional(),
    room_type: Joi.string().max(100).optional(),
    status: Joi.string().max(50).optional()
});

/**
 * Dashboard stats query validation
 */
const dashboardQuerySchema = Joi.object({
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().min(Joi.ref('start_date')).optional()
});

/**
 * Hotel validation schemas
 */
const hotelCreateSchema = Joi.object({
    hotel_name: Joi.string().min(2).max(255).required().messages({
        'string.empty': 'Hotel name is required'
    }),
    hotel_type: Joi.string().max(100).required(),
    address: Joi.string().required(),
    total_rooms: Joi.number().integer().min(0).default(0)
});

const hotelUpdateSchema = Joi.object({
    hotel_name: Joi.string().min(2).max(255).optional(),
    hotel_type: Joi.string().max(100).optional(),
    address: Joi.string().optional(),
    total_rooms: Joi.number().integer().min(0).optional()
});

/**
 * Room validation schemas
 */
const roomCreateSchema = Joi.object({
    hotel_id: Joi.number().integer().positive().required(),
    room_number: Joi.string().max(50).required(),
    room_type: Joi.string().max(100).required(),
    room_status: Joi.string().valid('Available', 'Reserved', 'Occupied', 'Maintenance').default('Available'),
    capacity: Joi.number().integer().positive().default(1)
});

const roomUpdateSchema = Joi.object({
    room_number: Joi.string().max(50).optional(),
    room_type: Joi.string().max(100).optional(),
    room_status: Joi.string().valid('Available', 'Reserved', 'Occupied', 'Maintenance').optional(),
    capacity: Joi.number().integer().positive().optional()
});

/**
 * Reservation validation schemas
 */
const reservationCreateSchema = Joi.object({
    guest_id: Joi.number().integer().positive().required(),
    hotel_id: Joi.number().integer().positive().required(),
    room_id: Joi.number().integer().positive().allow(null).optional(),
    check_in_date: Joi.date().iso().required(),
    check_out_date: Joi.date().iso().min(Joi.ref('check_in_date')).required().messages({
        'date.min': 'Check-out date must be on or after the check-in date'
    }),
    reservation_status: Joi.string().valid('Pending', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled').default('Pending')
});

const reservationUpdateSchema = Joi.object({
    room_id: Joi.number().integer().positive().allow(null).optional(),
    check_in_date: Joi.date().iso().optional(),
    check_out_date: Joi.date().iso().optional(),
    reservation_status: Joi.string().valid('Pending', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled').optional()
}).and('check_in_date', 'check_out_date'); // if one is updated, both should be updated to re-validate limits

/**
 * VIP Allocation validation schemas
 */
const vipAllocationCreateSchema = Joi.object({
    guest_id: Joi.number().integer().positive().required(),
    hotel_id: Joi.number().integer().positive().required(),
    room_id: Joi.number().integer().positive().allow(null).optional(),
    allocation_status: Joi.string().valid('Assigned', 'Pending').default('Pending')
});

const vipAllocationUpdateSchema = Joi.object({
    room_id: Joi.number().integer().positive().allow(null).optional(),
    allocation_status: Joi.string().valid('Assigned', 'Pending').optional()
});

/**
 * Report export validation schema
 */
const reportExportSchema = Joi.object({
    format: Joi.string().valid('CSV', 'PDF').default('CSV'),
    report_type: Joi.string().valid('Utilization', 'VIP Allocations', 'Occupancy').default('Utilization'),
    filters: Joi.object({
        hotel_id: Joi.number().integer().positive().allow(null).optional(),
        room_type: Joi.string().max(100).allow(null, '').optional(),
        reservation_status: Joi.string().valid('Pending', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled').allow(null).optional(),
        check_in_from: Joi.date().iso().allow(null).optional(),
        check_out_to: Joi.date().iso().allow(null).optional()
    }).optional()
});

module.exports = {
    accommodationQuerySchema,
    dashboardQuerySchema,
    hotelCreateSchema,
    hotelUpdateSchema,
    roomCreateSchema,
    roomUpdateSchema,
    reservationCreateSchema,
    reservationUpdateSchema,
    vipAllocationCreateSchema,
    vipAllocationUpdateSchema,
    reportExportSchema
};
