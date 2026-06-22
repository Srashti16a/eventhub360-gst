const express = require('express');
const router = express.Router();
const MagicLinkController = require('../controllers/MagicLinkController');
const {
    magicLinkCreateSchema,
    magicLinkBulkCreateSchema,
    magicLinkQuerySchema,
    magicLinkDistributeSchema
} = require('../models/MagicLinkValidation');

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

// Static & Special Actions routes first to prevent parameter conflicts with :id
router.get('/stats', MagicLinkController.getStats);
router.get('/export', MagicLinkController.export);
router.get('/resolve/:token', MagicLinkController.resolve);
router.post('/bulk', validate(magicLinkBulkCreateSchema, 'body'), MagicLinkController.createBulk);

// CRUD Endpoints
router.post('/', validate(magicLinkCreateSchema, 'body'), MagicLinkController.create);
router.get('/', validate(magicLinkQuerySchema, 'query'), MagicLinkController.list);
router.get('/:id', MagicLinkController.getById);

// Action Endpoints
router.post('/:id/regenerate', MagicLinkController.regenerate);
router.post('/:id/revoke', MagicLinkController.revoke);
router.post('/:id/distribute', validate(magicLinkDistributeSchema, 'body'), MagicLinkController.distribute);

module.exports = router;
