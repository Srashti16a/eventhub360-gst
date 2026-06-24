const express = require('express');
const router = express.Router();
const CheckInController = require('../controllers/CheckInController');
const {
    dashboardQuerySchema,
    checkInRecordQuerySchema,
    manualCheckInSchema,
    qrScanCheckInSchema,
    guestFlagCreateSchema,
    guestFlagReviewSchema,
    entryGateCreateSchema,
    entryGateUpdateSchema,
    staffAssignSchema
} = require('../models/CheckInValidation');

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

// 1. Live Check-In Dashboard Analytics & Alerts
router.get(
    '/dashboard',
    validate(dashboardQuerySchema, 'query'),
    CheckInController.getDashboard
);

router.get(
    '/feeds',
    CheckInController.getRecentFeeds
);

router.get(
    '/vip-alerts',
    CheckInController.getVipAlerts
);

router.put(
    '/vip-alerts/:alertId/read',
    CheckInController.markAlertRead
);

// 2. Check-In Actions (Manual override vs QR scan gates)
router.post(
    '/manual',
    validate(manualCheckInSchema, 'body'),
    CheckInController.manualCheckIn
);

router.post(
    '/qr-scan',
    validate(qrScanCheckInSchema, 'body'),
    CheckInController.qrCheckIn
);

// 3. Guest flagging workflows
router.post(
    '/flags',
    validate(guestFlagCreateSchema, 'body'),
    CheckInController.flagGuest
);

router.put(
    '/flags/:flagId',
    validate(guestFlagReviewSchema, 'body'),
    CheckInController.reviewFlag
);

// 4. Gates configurations
router.get(
    '/gates',
    CheckInController.getGates
);

router.post(
    '/gates',
    validate(entryGateCreateSchema, 'body'),
    CheckInController.createGate
);

router.put(
    '/gates/:gateId',
    validate(entryGateUpdateSchema, 'body'),
    CheckInController.updateGate
);

// 5. Shift staff routing
router.get(
    '/staff',
    CheckInController.getStaff
);

router.post(
    '/staff',
    validate(staffAssignSchema, 'body'),
    CheckInController.assignStaff
);

module.exports = router;
