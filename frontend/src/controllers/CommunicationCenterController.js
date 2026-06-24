const CampaignService = require('../models/CampaignService');
const CommunicationService = require('../models/CommunicationService');

class CommunicationCenterController {
    // Helper to retrieve company and user contexts from headers
    _getContext(req) {
        const companyId = parseInt(req.headers['x-company-id'], 10);
        const branchId = req.headers['x-branch-id'] ? parseInt(req.headers['x-branch-id'], 10) : null;
        const userId = req.headers['x-user-id'] 
            ? parseInt(req.headers['x-user-id'], 10) 
            : (req.user ? req.user.id : null);

        if (!companyId || isNaN(companyId)) {
            const error = new Error('X-Company-ID header is required and must be a valid integer');
            error.status = 400;
            throw error;
        }

        return { companyId, branchId, userId };
    }

    // ==========================================
    // 1. Templates Management
    // ==========================================
    async createTemplate(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await CommunicationService.createTemplate(req.body, context);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async updateTemplate(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid template ID' });
            }
            const result = await CommunicationService.updateTemplate(id, req.body, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async listTemplates(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await CommunicationService.listTemplates(req.query, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getTemplateById(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid template ID' });
            }
            const result = await CommunicationService.getTemplateById(id, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async deleteTemplate(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid template ID' });
            }
            await CommunicationService.deleteTemplate(id, context);
            res.status(200).json({ success: true, message: 'Template deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 2. Audience Segments
    // ==========================================
    async createSegment(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await CommunicationService.createSegment(req.body, context);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getSegmentById(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid segment ID' });
            }
            const result = await CommunicationService.getSegmentById(id, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async listSegments(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await CommunicationService.listSegments(context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async deleteSegment(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid segment ID' });
            }
            await CommunicationService.deleteSegment(id, context);
            res.status(200).json({ success: true, message: 'Segment deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    async getSegmentMembers(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid segment ID' });
            }
            const result = await CommunicationService.getSegmentMembers(id, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async resolveSegment(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid segment ID' });
            }
            const result = await CommunicationService.resolveAndCacheSegmentMembers(id, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 3. Campaigns
    // ==========================================
    async createCampaign(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await CampaignService.createCampaign(req.body, context);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async updateCampaign(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid campaign ID' });
            }
            const result = await CampaignService.updateCampaign(id, req.body, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async listCampaigns(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await CampaignService.listCampaigns(req.query, context);
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    async getCampaignById(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid campaign ID' });
            }
            const result = await CampaignService.getCampaignById(id, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async scheduleCampaign(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid campaign ID' });
            }
            const result = await CampaignService.scheduleCampaign(id, req.body, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async publishCampaign(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid campaign ID' });
            }
            const result = await CampaignService.publishCampaign(id, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async listCampaignRecipients(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid campaign ID' });
            }
            const result = await CampaignService.listCampaignRecipients(id, req.query, context);
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    async getCampaignAnalytics(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid campaign ID' });
            }
            const result = await CampaignService.getCampaignAnalytics(id, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 4. Interaction Webhooks
    // ==========================================
    async trackInteraction(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await CampaignService.trackInteraction(req.body.recipient_id, req.body.action, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 5. Opt Out Registry
    // ==========================================
    async saveOptOut(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await CommunicationService.saveOptOut(req.body, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 6. Logs & Performance Dashboards
    // ==========================================
    async getChannelHealth(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await CommunicationService.getChannelHealthCheck(context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getLogs(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await CommunicationService.getCommunicationLogs(req.query, context);
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 7. Background Worker Trigger Emulation
    // ==========================================
    async triggerProcessScheduled(req, res, next) {
        try {
            const result = await CampaignService.processScheduledCampaigns();
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    async triggerProcessQueue(req, res, next) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
            const result = await CampaignService.processNotificationQueue(limit);
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CommunicationCenterController();
