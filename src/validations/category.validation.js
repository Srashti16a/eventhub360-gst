const Joi = require('joi');

const assignCategorySchema = Joi.object({
  category: Joi.string()
    .trim()
    .max(20)
    .required()
    .messages({
      'string.empty': 'Category name cannot be empty',
      'string.max': 'Category name cannot exceed 20 characters',
      'any.required': 'Category name is required',
    }),
});

const queryCategorySchema = Joi.object({
  event: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Event ID must be a number',
    }),
  search: Joi.string().trim().optional(),
  page: Joi.number().integer().positive().optional(),
  limit: Joi.number().integer().positive().optional(),
});

module.exports = {
  assignCategorySchema,
  queryCategorySchema,
};
