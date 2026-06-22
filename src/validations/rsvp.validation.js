const Joi = require('joi');

const submitRsvpSchema = Joi.object({
  status: Joi.string()
    .valid('yes', 'no', 'maybe')
    .required()
    .messages({
      'any.only': 'RSVP status must be one of yes, no, maybe',
      'any.required': 'RSVP status is required',
    }),
  pax: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Pax must be a number',
      'number.integer': 'Pax must be an integer',
      'number.min': 'Pax must be at least 1',
    }),
  meal_preferences: Joi.array()
    .items(Joi.string().trim().max(40))
    .optional()
    .messages({
      'array.base': 'Meal preferences must be an array of strings',
    }),
});

module.exports = {
  submitRsvpSchema,
};
