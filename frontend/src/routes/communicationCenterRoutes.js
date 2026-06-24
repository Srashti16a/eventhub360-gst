const express = require('express');
const router = express.Router();
const CommunicationCenterController = require('../controllers/CommunicationCenterController');

const {
    campaignCreateSchema,
    campaignUpdateSchema,
    broadcastScheduleSchema,
    trackingWebhookSchema,
    campaignQuerySchema
} = require('../models/CampaignValidation');

const {
    communicationTemplateCreateSchema,
    communicationTemplateUpdateSchema,
    audienceSegmentCreateSchema,
    optOutPreferenceSaveSchema,
    communicationLogQuerySchema
} = require('../models/CommunicationValidation');

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

// ==========================================
// 1. Templates Endpoints
// ==========================================
router.post(
    '/templates',
    validate(communicationTemplateCreateSchema, 'body'),
    CommunicationCenterController.createTemplate.bind(CommunicationCenterController)
);

router.get(
    '/templates',
    CommunicationCenterController.listTemplates.bind(CommunicationCenterController)
);

router.get(
    '/templates/:id',
    CommunicationCenterController.getTemplateById.bind(CommunicationCenterController)
);

router.put(
    '/templates/:id',
    validate(communicationTemplateUpdateSchema, 'body'),
    CommunicationCenterController.updateTemplate.bind(CommunicationCenterController)
);

router.delete(
    '/templates/:id',
    CommunicationCenterController.deleteTemplate.bind(CommunicationCenterController)
);

// ==========================================
// 2. Audience Segment Endpoints
// ==========================================
router.post(
    '/segments',
    validate(audienceSegmentCreateSchema, 'body'),
    CommunicationCenterController.createSegment.bind(CommunicationCenterController)
);

router.get(
    '/segments',
    CommunicationCenterController.listSegments.bind(CommunicationCenterController)
);

router.get(
    '/segments/:id',
    CommunicationCenterController.getSegmentById.bind(CommunicationCenterController)
);

router.delete(
    '/segments/:id',
    CommunicationCenterController.deleteSegment.bind(CommunicationCenterController)
);

router.get(
    '/segments/:id/members',
    CommunicationCenterController.getSegmentMembers.bind(CommunicationCenterController)
);

router.post(
    '/segments/:id/resolve',
    CommunicationCenterController.resolveSegment.bind(CommunicationCenterController)
);

// ==========================================
// 3. Campaign Endpoints
// ==========================================
router.post(
    '/campaigns',
    validate(campaignCreateSchema, 'body'),
    CommunicationCenterController.createCampaign.bind(CommunicationCenterController)
);

router.get(
    '/campaigns',
    validate(campaignQuerySchema, 'query'),
    CommunicationCenterController.listCampaigns.bind(CommunicationCenterController)
);

router.get(
    '/campaigns/:id',
    CommunicationCenterController.getCampaignById.bind(CommunicationCenterController)
);

router.put(
    '/campaigns/:id',
    validate(campaignUpdateSchema, 'body'),
    CommunicationCenterController.updateCampaign.bind(CommunicationCenterController)
);

router.post(
    '/campaigns/:id/schedule',
    validate(broadcastScheduleSchema, 'body'),
    CommunicationCenterController.scheduleCampaign.bind(CommunicationCenterController)
);

router.post(
    '/campaigns/:id/publish',
    CommunicationCenterController.publishCampaign.bind(CommunicationCenterController)
);

router.get(
    '/campaigns/:id/recipients',
    CommunicationCenterController.listCampaignRecipients.bind(CommunicationCenterController)
);

router.get(
    '/campaigns/:id/analytics',
    CommunicationCenterController.getCampaignAnalytics.bind(CommunicationCenterController)
);

// ==========================================
// 4. Interaction Trackers (Webhooks)
// ==========================================
router.post(
    '/webhooks/track',
    validate(trackingWebhookSchema, 'body'),
    CommunicationCenterController.trackInteraction.bind(CommunicationCenterController)
);

// ==========================================
// 5. Opt Out Registry Endpoints
// ==========================================
router.post(
    '/opt-out',
    validate(optOutPreferenceSaveSchema, 'body'),
    CommunicationCenterController.saveOptOut.bind(CommunicationCenterController)
);

// ==========================================
// 6. Logs & Health / Performance Dashboards
// ==========================================
router.get(
    '/health',
    CommunicationCenterController.getChannelHealth.bind(CommunicationCenterController)
);

router.get(
    '/logs',
    validate(communicationLogQuerySchema, 'query'),
    CommunicationCenterController.getLogs.bind(CommunicationCenterController)
);

// ==========================================
// 7. Background Worker Trigger Emulations (Testing)
// ==========================================
router.post(
    '/worker/process-scheduled',
    CommunicationCenterController.triggerProcessScheduled.bind(CommunicationCenterController)
);

router.post(
    '/worker/process-queue',
    CommunicationCenterController.triggerProcessQueue.bind(CommunicationCenterController)
);

module.exports = router;
