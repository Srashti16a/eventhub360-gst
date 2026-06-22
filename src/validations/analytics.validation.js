const Joi = require('joi');

const queryAnalyticsSchema = Joi.object({
  event: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Event ID must be a number',
      'any.required': 'Event ID is required',
    }),
});

module.exports = {
  queryAnalyticsSchema,
};
