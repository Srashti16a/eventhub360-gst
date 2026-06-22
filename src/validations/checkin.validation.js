const Joi = require('joi');

const createCheckinSchema = Joi.object({
  qr_code: Joi.string()
    .trim()
    .max(64)
    .required()
    .messages({
      'string.empty': 'QR code is required',
      'string.max': 'QR code cannot exceed 64 characters',
      'any.required': 'QR code is required',
    }),
  event_guest_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Event guest ID must be a number',
      'number.integer': 'Event guest ID must be an integer',
    }),
});

module.exports = {
  createCheckinSchema,
};
