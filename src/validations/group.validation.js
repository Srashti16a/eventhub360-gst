const Joi = require('joi');

const createGroupSchema = Joi.object({
  name: Joi.string()
    .trim()
    .max(60)
    .required()
    .messages({
      'string.empty': 'Group name is required',
      'string.max': 'Group name cannot exceed 60 characters',
      'any.required': 'Group name is required',
    }),
  event_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Event ID must be a number',
      'any.required': 'Event ID is required',
    }),
  tenant_id: Joi.number().integer().positive().optional(),
  company_id: Joi.number().integer().positive().optional(),
  branch_id: Joi.number().integer().positive().optional(),
});

const updateGroupSchema = Joi.object({
  name: Joi.string()
    .trim()
    .max(60)
    .optional()
    .messages({
      'string.max': 'Group name cannot exceed 60 characters',
    }),
  is_active: Joi.boolean().optional(),
}).or('name', 'is_active'); // At least one field must be provided

const addMemberSchema = Joi.object({
  guest_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Guest ID must be a number',
      'any.required': 'Guest ID is required',
    }),
});

module.exports = {
  createGroupSchema,
  updateGroupSchema,
  addMemberSchema,
};
