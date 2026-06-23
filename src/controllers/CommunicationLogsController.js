const CommunicationLogService = require('../models/CommunicationLogService');

class CommunicationLogsController {
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

    async getDashboardStats(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await CommunicationLogService.getDashboardStats(context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async listLogs(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await CommunicationLogService.listLogs(req.query, context);
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    async getLogDetails(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid delivery log ID' });
            }
            const result = await CommunicationLogService.getLogDetails(id, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async createLog(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await CommunicationLogService.createLog(req.body, context);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async trackWebhook(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await CommunicationLogService.trackDeliveryReceipt(req.body, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async logRetryAttempt(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await CommunicationLogService.logRetryAttempt(req.body, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async rerouteTraffic(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await CommunicationLogService.rerouteTraffic(req.body, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getTrafficReroutes(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await CommunicationLogService.getTrafficReroutes(context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getAutomationAlerts(req, res, next) {
        try {
            const context = this._getContext(req);
            const status = req.query.status || 'Active';
            const result = await CommunicationLogService.getAutomationAlerts(status, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async updateAlertStatus(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid alert ID' });
            }
            const result = await CommunicationLogService.updateAlertStatus(id, req.body.status, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async exportLogs(req, res, next) {
        try {
            const context = this._getContext(req);
            const csv = await CommunicationLogService.exportLogsCsv(req.query, context);
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=communication_monitoring_logs.csv');
            res.status(200).send(csv);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CommunicationLogsController();
