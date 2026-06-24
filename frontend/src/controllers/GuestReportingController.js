const GuestReportingService = require('../models/GuestReportingService');

class GuestReportingController {
    // Helper to retrieve company and user contexts from headers
    _getContext = (req) => {
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
    // 1. Saved Report Templates
    // ==========================================
    createTemplate = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const result = await GuestReportingService.createTemplate(req.body, context);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    listTemplates = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const result = await GuestReportingService.listTemplates(context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    getTemplateById = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid template ID' });
            }
            const result = await GuestReportingService.getTemplateById(id, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    deleteTemplate = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid template ID' });
            }
            await GuestReportingService.deleteTemplate(id, context);
            res.status(200).json({ success: true, message: 'Report template deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 2. Dynamic Report Builder Previews
    // ==========================================
    previewReport = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const eventId = parseInt(req.params.eventId, 10);
            const templateId = req.query.template_id ? parseInt(req.query.template_id, 10) : null;
            
            if (isNaN(eventId)) {
                return res.status(400).json({ success: false, error: 'Invalid event ID' });
            }
            
            const result = await GuestReportingService.previewReport(eventId, templateId, req.body, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 3. Reports & Auditable Snapshots
    // ==========================================
    createReport = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const result = await GuestReportingService.createReport(req.body, context);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    getReportDetails = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid report ID' });
            }
            const result = await GuestReportingService.getReportDetails(id, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    listReports = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const eventId = req.query.event_id ? parseInt(req.query.event_id, 10) : null;
            if (!eventId || isNaN(eventId)) {
                return res.status(400).json({ success: false, error: 'event_id query parameter is required' });
            }
            const result = await GuestReportingService.listReports(eventId, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    deleteReport = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid report ID' });
            }
            await GuestReportingService.deleteReport(id, context);
            res.status(200).json({ success: true, message: 'Guest report deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 4. Reports CSV Exports
    // ==========================================
    exportReportCsv = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid report ID' });
            }
            const result = await GuestReportingService.exportReportCsv(id, context);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="report_${id}_export.csv"`);
            res.status(200).send(result);
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 5. Export Histories
    // ==========================================
    logExport = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const result = await GuestReportingService.logExport(req.body, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    getExportHistory = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const result = await GuestReportingService.getExportHistory(context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 6. Dashboard Analytics Summaries
    // ==========================================
    getDashboardOverview = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const eventId = parseInt(req.params.eventId, 10);
            if (isNaN(eventId)) {
                return res.status(400).json({ success: false, error: 'Invalid event ID' });
            }
            const result = await GuestReportingService.getDashboardOverview(eventId, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    getCategoryAnalytics = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const eventId = parseInt(req.params.eventId, 10);
            if (isNaN(eventId)) {
                return res.status(400).json({ success: false, error: 'Invalid event ID' });
            }
            const result = await GuestReportingService.getCategoryAnalytics(eventId, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    getAttendanceTrends = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const eventId = parseInt(req.params.eventId, 10);
            if (isNaN(eventId)) {
                return res.status(400).json({ success: false, error: 'Invalid event ID' });
            }
            const result = await GuestReportingService.getAttendanceTrends(eventId, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    triggerAnalyticsRefresh = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const eventId = parseInt(req.params.eventId, 10);
            if (isNaN(eventId)) {
                return res.status(400).json({ success: false, error: 'Invalid event ID' });
            }
            const result = await GuestReportingService.triggerAnalyticsRefresh(eventId, context);
            res.status(200).json({ success: true, message: result.message });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new GuestReportingController();
