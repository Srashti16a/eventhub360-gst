const Joi = require('joi');

const updateSeatingSchema = Joi.object({
  table_no: Joi.string()
    .trim()
    .max(10)
    .messages({
      'string.max': 'Table number cannot exceed 10 characters',
    }),
  seat_no: Joi.string()
    .trim()
    .max(10)
    .messages({
      'string.max': 'Seat number cannot exceed 10 characters',
    }),
})
  .or('table_no', 'seat_no')
  .messages({
    'object.missing': 'At least one of table_no or seat_no must be provided',
  });

module.exports = {
  updateSeatingSchema,
};
