const express = require('express');
const router = express.Router();
const QrPassController = require('../controllers/QrPassController');
const {
    dashboardQuerySchema,
    registryQuerySchema,
    generatePassSchema,
    generateBatchPassSchema,
    deliverPassSchema,
    scanVerifySchema,
    registerScannerDeviceSchema,
    revokePassSchema,
    exportLogsQuerySchema
} = require('../models/QrPassValidation');

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

// 1. QR Pass Dashboard Stats & Registry Listings
router.get(
    '/dashboard',
    validate(dashboardQuerySchema, 'query'),
    QrPassController.getDashboard
);

router.get(
    '/registry',
    validate(registryQuerySchema, 'query'),
    QrPassController.getRegistry
);

router.get(
    '/registry/:passId/preview',
    QrPassController.getPreview
);

// 2. Pass Generations Endpoints
router.post(
    '/generate',
    validate(generatePassSchema, 'body'),
    QrPassController.generatePass
);

router.post(
    '/batch-generate',
    validate(generateBatchPassSchema, 'body'),
    QrPassController.generateBatch
);

// 3. Dispatch Delivery tracking
router.post(
    '/registry/:passId/deliver',
    validate(deliverPassSchema, 'body'),
    QrPassController.deliverPass
);

// 4. Device verification endpoint
router.post(
    '/scan-verify',
    validate(scanVerifySchema, 'body'),
    QrPassController.verifyScan
);

router.post(
    '/devices/register',
    validate(registerScannerDeviceSchema, 'body'),
    QrPassController.registerDevice
);

// 5. Pass Revocations
router.post(
    '/registry/:passId/revoke',
    validate(revokePassSchema, 'body'),
    QrPassController.revokePass
);

// 6. Logs Exports
router.get(
    '/export-logs',
    validate(exportLogsQuerySchema, 'query'),
    QrPassController.exportLogs
);

module.exports = router;
