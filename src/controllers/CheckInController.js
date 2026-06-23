const CheckInService = require('../models/CheckInService');
const CheckInRepository = require('../models/CheckInRepository');

class CheckInController {
    /**
     * Get live dashboard analytics
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

            const data = await CheckInService.getDashboardData(eventId, companyId);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get recent logs feeds
     */
    async getRecentFeeds(req, res, next) {
        try {
            const eventId = parseInt(req.query.event_id, 10);
            const limit = parseInt(req.query.limit || 5, 10);

            if (!eventId || isNaN(eventId)) {
                return res.status(400).json({ success: false, error: 'event_id is required' });
            }

            const data = await CheckInService.getCheckInFeed(eventId, limit);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get VIP arrival alert notifications feed
     */
    async getVipAlerts(req, res, next) {
        try {
            const eventId = parseInt(req.query.event_id, 10);
            if (!eventId || isNaN(eventId)) {
                return res.status(400).json({ success: false, error: 'event_id is required' });
            }

            const data = await CheckInService.getUnreadVipAlerts(eventId);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mark VIP alert read
     */
    async markAlertRead(req, res, next) {
        try {
            const alertId = parseInt(req.params.alertId, 10);
            if (!alertId || isNaN(alertId)) {
                return res.status(400).json({ success: false, error: 'alertId is required' });
            }

            await CheckInRepository.markVipAlertRead(alertId);
            res.status(200).json({ success: true, message: 'Alert marked as read' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Manual Override Guest Check-In
     */
    async manualCheckIn(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const userId = 1;

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }

            const record = await CheckInService.manualCheckInGuest(req.body, companyId, userId);
            res.status(201).json({ success: true, message: 'Manual check-in override successful', data: record });
        } catch (error) {
            next(error);
        }
    }

    /**
     * QR Code Scanner Check-In Gate entrance
     */
    async qrCheckIn(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const deviceToken = req.headers['x-device-token'];
            const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }
            if (!deviceToken) {
                return res.status(401).json({ success: false, error: 'Missing X-Device-Token authorization header' });
            }

            const record = await CheckInService.qrScanCheckInGuest(req.body, companyId, deviceToken, clientIp);
            res.status(200).json({ success: true, message: 'QR check-in validated successfully', data: record });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Flags guest security override
     */
    async flagGuest(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const userId = 1;

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }

            const flag = await CheckInService.flagGuest(req.body, companyId, userId);
            res.status(201).json({ success: true, message: 'Guest flagged successfully', data: flag });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Review guest security flags
     */
    async reviewFlag(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const flagId = parseInt(req.params.flagId, 10);
            const userId = 1;

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }
            if (!flagId || isNaN(flagId)) {
                return res.status(400).json({ success: false, error: 'flagId parameter is required' });
            }

            const flag = await CheckInService.reviewFlag(flagId, req.body.flag_status, companyId, userId);
            res.status(200).json({ success: true, message: 'Flag status reviewed successfully', data: flag });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get monitoring status for gates
     */
    async getGates(req, res, next) {
        try {
            const eventId = parseInt(req.query.event_id, 10);
            if (!eventId || isNaN(eventId)) {
                return res.status(400).json({ success: false, error: 'event_id query parameter is required' });
            }

            const data = await CheckInService.getEntryGatesMetrics(eventId);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create Gate configuration
     */
    async createGate(req, res, next) {
        try {
            const gate = await CheckInRepository.createGate(req.body);
            res.status(201).json({ success: true, message: 'Entry gate created successfully', data: gate });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update Gate status
     */
    async updateGate(req, res, next) {
        try {
            const gateId = parseInt(req.params.gateId, 10);
            if (!gateId || isNaN(gateId)) {
                return res.status(400).json({ success: false, error: 'gateId is required' });
            }

            const gate = await CheckInRepository.updateGate(gateId, req.body);
            res.status(200).json({ success: true, message: 'Entry gate updated successfully', data: gate });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Assign shift check-in staff
     */
    async assignStaff(req, res, next) {
        try {
            const shift = await CheckInRepository.createStaffShift(req.body);
            res.status(201).json({ success: true, message: 'Shift staff assigned successfully', data: shift });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Read staff shifts
     */
    async getStaff(req, res, next) {
        try {
            const eventId = parseInt(req.query.event_id, 10);
            if (!eventId || isNaN(eventId)) {
                return res.status(400).json({ success: false, error: 'event_id query parameter is required' });
            }

            const data = await CheckInRepository.getStaffShiftsByEvent(eventId);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CheckInController();
