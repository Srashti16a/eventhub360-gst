const express = require('express');
const router = express.Router();
const SeatingController = require('../controllers/SeatingController');
const {
    dashboardQuerySchema,
    layoutQuerySchema,
    tableCreateSchema,
    tableUpdateSchema,
    dragAndDropBulkSaveSchema,
    seatAssignmentSchema,
    layoutSaveSchema,
    layoutVersionSchema
} = require('../models/SeatingValidation');

/**
 * Request validation middleware helper
 * @param {Object} schema - Joi validation schema
 * @param {'body' | 'query' | 'params'} [property] - Target data to validate
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], { abortEarly: false });
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ success: false, error: errorMessage });
        }
        req[property] = value;
        next();
    };
};

// 1. Seating Dashboard Analytics
router.get(
    '/dashboard',
    validate(dashboardQuerySchema, 'query'),
    SeatingController.getDashboard
);

// 2. Layouts Management
router.get(
    '/layouts/:layoutId',
    SeatingController.getLayout
);

router.put(
    '/layouts/:layoutId',
    validate(layoutSaveSchema, 'body'),
    SeatingController.saveLayout
);

router.post(
    '/layouts/clone',
    validate(layoutVersionSchema, 'body'),
    SeatingController.cloneLayoutVersion
);

router.post(
    '/layouts/:layoutId/validate',
    SeatingController.runValidation
);

// 3. Tables Management
router.post(
    '/tables',
    validate(tableCreateSchema, 'body'),
    SeatingController.createTable
);

router.put(
    '/tables/:tableId',
    validate(tableUpdateSchema, 'body'),
    SeatingController.updateTable
);

router.delete(
    '/tables/:tableId',
    SeatingController.deleteTable
);

router.post(
    '/tables/bulk-positions',
    validate(dragAndDropBulkSaveSchema, 'body'),
    SeatingController.bulkUpdateTablePositions
);

// 4. Seating Mappings & Assignments
router.post(
    '/assignments',
    validate(seatAssignmentSchema, 'body'),
    SeatingController.assignGuest
);

router.delete(
    '/layouts/:layoutId/guests/:guestId',
    SeatingController.removeAssignment
);

module.exports = router;
