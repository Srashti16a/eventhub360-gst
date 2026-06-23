const QrPassService = require('../models/QrPassService');

class QrPassController {
    /**
     * Get dashboard telemetry
     */
    async getDashboard(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const eventId = parseInt(req.query.event_id, 10);

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }
            if (!eventId || isNaN(eventId)) {
                return res.status(400).json({ success: false, error: 'event_id query parameter is required' });
            }

            const data = await QrPassService.getDashboardAnalytics(eventId, companyId);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Fetch registry passes
     */
    async getRegistry(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const { event_id, page, limit, search, pass_type, status } = req.query;

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }

            const data = await QrPassService.getPassesRegistry(parseInt(event_id, 10), companyId, {
                page: parseInt(page || 1, 10),
                limit: parseInt(limit || 10, 10),
                search,
                pass_type,
                status
            });
            res.status(200).json({ success: true, ...data });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get pass preview details
     */
    async getPreview(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const passId = parseInt(req.params.passId, 10);

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }
            if (!passId || isNaN(passId)) {
                return res.status(400).json({ success: false, error: 'passId parameter is required' });
            }

            const data = await QrPassService.getPassPreview(passId, companyId);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create single guest pass
     */
    async generatePass(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const userId = 1;

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }

            const pass = await QrPassService.generateQrPass(req.body, companyId, userId);
            res.status(201).json({ success: true, message: 'QR pass generated successfully', data: pass });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Trigger batch job
     */
    async generateBatch(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const userId = 1;

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }

            const result = await QrPassService.generateBatchQrPasses(req.body, companyId, userId);
            res.status(202).json({ success: true, message: 'Batch QR passes generation started', data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Dispatch pass via email/whatsapp
     */
    async deliverPass(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const passId = parseInt(req.params.passId, 10);

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }

            const result = await QrPassService.deliverQrPass(passId, req.body, companyId);
            res.status(200).json({ success: true, message: 'QR pass delivered successfully', data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Device Gate Scan verification endpoint
     */
    async verifyScan(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            // Expect Device Authorization header instead of normal Bearer JWT
            const deviceToken = req.headers['x-device-token']; 
            const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }
            if (!deviceToken) {
                return res.status(401).json({ success: false, error: 'Authorization failed: Missing X-Device-Token authorization header' });
            }

            const result = await QrPassService.verifyAndTrackPassScan(req.body, companyId, deviceToken, clientIp);
            if (result.verified) {
                res.status(200).json({ success: true, data: result });
            } else {
                res.status(403).json({ success: false, data: result });
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Revoke QR Pass access
     */
    async revokePass(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const passId = parseInt(req.params.passId, 10);
            const userId = 1;

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }

            await QrPassService.revokeQrPass(passId, req.body, companyId, userId);
            res.status(200).json({ success: true, message: 'QR pass revoked successfully' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Register scanner device client
     */
    async registerDevice(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }

            const device = await QrPassService.registerDevice(req.body, companyId);
            res.status(201).json({ success: true, message: 'Scanner device registered successfully', data: device });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Export csv scans log
     */
    async exportLogs(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const { event_id, start_date, end_date } = req.query;

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }

            const csvData = await QrPassService.exportScanLogsCsv(parseInt(event_id, 10), companyId, { start_date, end_date });
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=qr_pass_scans_${event_id}.csv`);
            res.status(200).send(csvData);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new QrPassController();
