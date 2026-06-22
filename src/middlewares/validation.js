/**
 * Express middleware to validate request data using a Joi schema.
 * @param {Joi.Schema} schema - The Joi schema to validate against.
 * @param {string} [property='body'] - The property of the req object to validate (body, query, params).
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown fields from request payload
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join('; ');
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessage,
      });
    }

    // Replace the request property with the validated and cast value (e.g. string to number)
    req[property] = value;
    next();
  };
};

module.exports = validate;
// export default validate; -- using CommonJS standard to match node app requirements
