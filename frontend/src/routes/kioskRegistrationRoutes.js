const express = require('express');
const router = express.Router();
const KioskRegistrationController = require('../controllers/KioskRegistrationController');
const {
    kioskDeviceCreateSchema,
    kioskDeviceUpdateSchema,
    kioskSessionStartSchema,
    businessCardScanSchema,
    guestPhotoCaptureSchema,
    selfServiceRegisterSchema,
    conciergeAssistSchema,
    kioskLanguageSchema,
    queuePriorityUpdateSchema,
    kioskQuerySchema
} = require('../models/KioskRegistrationValidation');

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

// 1. Kiosk Devices Endpoints
router.post(
    '/devices',
    validate(kioskDeviceCreateSchema, 'body'),
    KioskRegistrationController.createDevice
);

router.get(
    '/devices',
    KioskRegistrationController.listDevices
);

router.get(
    '/devices/:id',
    KioskRegistrationController.getDeviceById
);

router.put(
    '/devices/:id',
    validate(kioskDeviceUpdateSchema, 'body'),
    KioskRegistrationController.updateDevice
);

// 2. Health Monitoring Endpoints
router.get(
    '/health',
    KioskRegistrationController.getHealth
);

// 3. Session Endpoints
router.post(
    '/sessions/start',
    validate(kioskSessionStartSchema, 'body'),
    KioskRegistrationController.startSession
);

router.post(
    '/sessions/:id/end',
    KioskRegistrationController.endSession
);

// 4. Business Card Scan
router.post(
    '/cards/scan',
    validate(businessCardScanSchema, 'body'),
    KioskRegistrationController.uploadScan
);

// 5. Profile Photo Capture
router.post(
    '/photos/capture',
    validate(guestPhotoCaptureSchema, 'body'),
    KioskRegistrationController.uploadPhoto
);

// 6. Registration Endpoints
router.post(
    '/register',
    validate(selfServiceRegisterSchema, 'body'),
    KioskRegistrationController.register
);

// 7. Concierge Assistance
router.post(
    '/assist',
    validate(conciergeAssistSchema, 'body'),
    KioskRegistrationController.assist
);

// 8. Languages Support Endpoints
router.get(
    '/languages',
    KioskRegistrationController.listLanguages
);

router.post(
    '/languages',
    validate(kioskLanguageSchema, 'body'),
    KioskRegistrationController.saveLanguage
);

// 9. Queue Management Endpoints
router.get(
    '/queue',
    KioskRegistrationController.getQueue
);

router.put(
    '/queue/:id',
    validate(queuePriorityUpdateSchema, 'body'),
    KioskRegistrationController.updateQueueItem
);

router.delete(
    '/queue/:id',
    KioskRegistrationController.removeFromQueue
);

module.exports = router;
