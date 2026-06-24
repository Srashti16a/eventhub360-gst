const express = require('express');
const router = express.Router();
const CommunicationLogsController = require('../controllers/CommunicationLogsController');

const {
    queryLogsSchema,
    webhookTrackingSchema,
    logRetrySchema,
    trafficRerouteSchema,
    alertStatusUpdateSchema
} = require('../models/CommunicationLogValidation');

/**
 * Request validation middleware helper
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

// 1. Dashboard Endpoint
router.get(
    '/dashboard/stats',
    CommunicationLogsController.getDashboardStats.bind(CommunicationLogsController)
);

// 2. Monitoring Logs Endpoints
router.get(
    '/logs',
    validate(queryLogsSchema, 'query'),
    CommunicationLogsController.listLogs.bind(CommunicationLogsController)
);

router.get(
    '/logs/export',
    validate(queryLogsSchema, 'query'),
    CommunicationLogsController.exportLogs.bind(CommunicationLogsController)
);

router.get(
    '/logs/:id',
    CommunicationLogsController.getLogDetails.bind(CommunicationLogsController)
);

router.post(
    '/logs',
    CommunicationLogsController.createLog.bind(CommunicationLogsController)
);

// 3. Webhooks Receipts tracking
router.post(
    '/webhooks/track',
    validate(webhookTrackingSchema, 'body'),
    CommunicationLogsController.trackWebhook.bind(CommunicationLogsController)
);

// 4. Retry history logs
router.post(
    '/logs/retry',
    validate(logRetrySchema, 'body'),
    CommunicationLogsController.logRetryAttempt.bind(CommunicationLogsController)
);

// 5. Traffic Reroutes
router.post(
    '/reroute',
    validate(trafficRerouteSchema, 'body'),
    CommunicationLogsController.rerouteTraffic.bind(CommunicationLogsController)
);

router.get(
    '/reroute',
    CommunicationLogsController.getTrafficReroutes.bind(CommunicationLogsController)
);

// 6. Automation Alerts
router.get(
    '/alerts',
    CommunicationLogsController.getAutomationAlerts.bind(CommunicationLogsController)
);

router.put(
    '/alerts/:id',
    validate(alertStatusUpdateSchema, 'body'),
    CommunicationLogsController.updateAlertStatus.bind(CommunicationLogsController)
);

module.exports = router;
