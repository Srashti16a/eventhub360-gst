const Joi = require('joi');

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().optional(),
  phone: Joi.string().trim().optional(),
  category: Joi.string().trim().optional(),
  email: Joi.string().trim().email().optional(),
  title: Joi.string().trim().optional(),
  company_name: Joi.string().trim().optional(),
  special_requests: Joi.string().trim().allow('').optional(),
  accommodation: Joi.object({
    hotel_name: Joi.string().trim().allow('').optional(),
    room_details: Joi.string().trim().allow('').optional(),
    check_in: Joi.string().trim().allow('').optional(),
    check_out: Joi.string().trim().allow('').optional(),
  }).optional(),
  transportation: Joi.object({
    service_type: Joi.string().trim().allow('').optional(),
    vehicle: Joi.string().trim().allow('').optional(),
    scheduled_time: Joi.string().trim().allow('').optional(),
    driver_name: Joi.string().trim().allow('').optional(),
    status: Joi.string().trim().allow('').optional(),
  }).optional(),
});

const createNoteSchema = Joi.object({
  content: Joi.string().trim().required().messages({
    'string.empty': 'Note content cannot be empty',
    'any.required': 'Note content is required',
  }),
  author: Joi.string().trim().optional(),
});

module.exports = {
  updateProfileSchema,
  createNoteSchema,
};
