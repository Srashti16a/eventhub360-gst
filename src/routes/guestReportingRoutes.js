const express = require('express');
const router = express.Router();
const GuestReportingController = require('../controllers/GuestReportingController');
const {
    templateCreateSchema,
    reportCreateSchema,
    exportHistorySchema,
    queryReportsSchema
} = require('../models/GuestReportingValidation');

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

// 1. Saved Report Templates
router.post(
    '/templates',
    validate(templateCreateSchema, 'body'),
    GuestReportingController.createTemplate
);

router.get(
    '/templates',
    GuestReportingController.listTemplates
);

router.get(
    '/templates/:id',
    GuestReportingController.getTemplateById
);

router.delete(
    '/templates/:id',
    GuestReportingController.deleteTemplate
);

// 2. Dynamic Report Builder Previews
router.post(
    '/preview/:eventId',
    GuestReportingController.previewReport
);

// 3. Reports & Auditable Snapshots
router.post(
    '/reports',
    validate(reportCreateSchema, 'body'),
    GuestReportingController.createReport
);

router.get(
    '/reports',
    validate(queryReportsSchema, 'query'),
    GuestReportingController.listReports
);

router.get(
    '/reports/:id',
    GuestReportingController.getReportDetails
);

router.delete(
    '/reports/:id',
    GuestReportingController.deleteReport
);

// 4. Reports CSV Exports
router.get(
    '/reports/:id/export',
    GuestReportingController.exportReportCsv
);

// 5. Export Histories
router.post(
    '/exports/log',
    validate(exportHistorySchema, 'body'),
    GuestReportingController.logExport
);

router.get(
    '/exports/history',
    GuestReportingController.getExportHistory
);

// 6. Dashboard Analytics Summaries
router.get(
    '/dashboard/overview/:eventId',
    GuestReportingController.getDashboardOverview
);

router.get(
    '/dashboard/categories/:eventId',
    GuestReportingController.getCategoryAnalytics
);

router.get(
    '/dashboard/trends/:eventId',
    GuestReportingController.getAttendanceTrends
);

router.post(
    '/dashboard/refresh/:eventId',
    GuestReportingController.triggerAnalyticsRefresh
);

module.exports = router;
