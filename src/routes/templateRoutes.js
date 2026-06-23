const express = require('express');
const router = express.Router();
const TemplateController = require('../controllers/TemplateController');
const {
    templateCreateSchema,
    templateUpdateSchema,
    templateQuerySchema
} = require('../models/TemplateValidation');

/**
 * Middleware wrapper for Joi payload and query validations
 * @param {Object} schema - Joi validation schema
 * @param {'body' | 'query'} [property] - Request target key to validate
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], { abortEarly: false });
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ success: false, error: errorMessage });
        }
        // Assign formatted values (like default values or parsed types) back to request
        req[property] = value;
        next();
    };
};

// Static route first to prevent parameter collisions with :id
router.get('/variables', TemplateController.getVariables);

// CRUD Endpoints
router.post('/', validate(templateCreateSchema, 'body'), TemplateController.create);
router.get('/', validate(templateQuerySchema, 'query'), TemplateController.list);
router.get('/:id', TemplateController.getById);
router.put('/:id', validate(templateUpdateSchema, 'body'), TemplateController.update);
router.delete('/:id', TemplateController.delete);

// Screen-Specific Action Endpoints
router.post('/:id/publish', TemplateController.publish);
router.post('/:id/preview', TemplateController.preview);

module.exports = router;
