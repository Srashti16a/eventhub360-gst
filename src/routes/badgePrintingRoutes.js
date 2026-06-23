const express = require('express');
const router = express.Router();
const BadgePrintingController = require('../controllers/BadgePrintingController');
const {
    badgeTemplateCreateSchema,
    badgeTemplateUpdateSchema,
    badgePrinterCreateSchema,
    badgePrinterUpdateSchema,
    badgePrintJobCreateSchema,
    badgePrintBatchCreateSchema,
    badgeConfigurationSaveSchema,
    printQueueReorderSchema,
    badgePrintingQuerySchema
} = require('../models/BadgePrintingValidation');

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

// 1. Badge Templates Endpoints
router.post(
    '/templates',
    validate(badgeTemplateCreateSchema, 'body'),
    BadgePrintingController.createTemplate
);

router.get(
    '/templates',
    validate(badgePrintingQuerySchema, 'query'),
    BadgePrintingController.listTemplates
);

router.get(
    '/templates/preview',
    BadgePrintingController.getPreview
);

router.get(
    '/templates/:id',
    BadgePrintingController.getTemplateById
);

router.put(
    '/templates/:id',
    validate(badgeTemplateUpdateSchema, 'body'),
    BadgePrintingController.updateTemplate
);

router.delete(
    '/templates/:id',
    BadgePrintingController.deleteTemplate
);

// 2. Printers Registry Endpoints
router.post(
    '/printers',
    validate(badgePrinterCreateSchema, 'body'),
    BadgePrintingController.registerPrinter
);

router.get(
    '/printers',
    BadgePrintingController.listPrinters
);

router.get(
    '/printers/:id',
    BadgePrintingController.getPrinterById
);

router.put(
    '/printers/:id',
    validate(badgePrinterUpdateSchema, 'body'),
    BadgePrintingController.updatePrinter
);

router.post(
    '/printers/:id/test-print',
    BadgePrintingController.testPrint
);

// 3. Printer Alerts Endpoints
router.get(
    '/alerts',
    BadgePrintingController.listAlerts
);

router.post(
    '/alerts/:id/resolve',
    BadgePrintingController.resolveAlert
);

// 4. Live Queue Management Endpoints
router.get(
    '/queue',
    BadgePrintingController.getQueue
);

router.post(
    '/queue/reorder',
    validate(printQueueReorderSchema, 'body'),
    BadgePrintingController.reorderQueue
);

router.post(
    '/queue/clear',
    BadgePrintingController.clearQueue
);

// 5. Single Badge Print Jobs
router.post(
    '/jobs',
    validate(badgePrintJobCreateSchema, 'body'),
    BadgePrintingController.createJob
);

router.get(
    '/jobs',
    validate(badgePrintingQuerySchema, 'query'),
    BadgePrintingController.listJobs
);

router.get(
    '/jobs/export',
    BadgePrintingController.exportHistory
);

router.post(
    '/jobs/recover-failed',
    BadgePrintingController.recoverFailed
);

router.post(
    '/jobs/:id/cancel',
    BadgePrintingController.cancelJob
);

router.post(
    '/jobs/:id/retry',
    BadgePrintingController.retryJob
);

// 6. Batch Badge Generation Endpoints
router.post(
    '/batches',
    validate(badgePrintBatchCreateSchema, 'body'),
    BadgePrintingController.createBatch
);

router.get(
    '/batches',
    validate(badgePrintingQuerySchema, 'query'),
    BadgePrintingController.listBatches
);

router.get(
    '/batches/:id',
    BadgePrintingController.getBatchById
);

// 7. Badge Configurations
router.get(
    '/configurations/:eventId',
    BadgePrintingController.getConfig
);

router.post(
    '/configurations',
    validate(badgeConfigurationSaveSchema, 'body'),
    BadgePrintingController.saveConfig
);

module.exports = router;
