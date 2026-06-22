const Joi = require('joi');

const updateOrganizationSchema = Joi.object({
  company_name: Joi.string().trim().max(120).optional(),
  tax_id: Joi.string().trim().max(50).optional(),
  address: Joi.string().trim().optional(),
  timezone: Joi.string().trim().max(100).optional(),
  currency: Joi.string().trim().max(20).optional(),
});

const uploadLogoSchema = Joi.object({
  logo: Joi.string().trim().required().messages({
    'string.empty': 'Logo source string cannot be empty',
    'any.required': 'Logo source string is required',
  }),
});

module.exports = {
  updateOrganizationSchema,
  uploadLogoSchema,
};
