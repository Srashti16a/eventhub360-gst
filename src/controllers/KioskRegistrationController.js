const KioskRegistrationService = require('../models/KioskRegistrationService');

class KioskRegistrationController {
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
    // 1. Kiosk Devices & Health Monitoring
    // ==========================================
    async createDevice(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await KioskRegistrationService.registerDevice(req.body, context);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async updateDevice(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid device ID' });
            }
            const result = await KioskRegistrationService.updateDevice(id, req.body, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async listDevices(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await KioskRegistrationService.listDevices(context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getDeviceById(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid device ID' });
            }
            const result = await KioskRegistrationService.getDeviceById(id, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getHealth(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await KioskRegistrationService.getKioskHealth(context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 2. Kiosk Sessions
    // ==========================================
    async startSession(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await KioskRegistrationService.startSession(req.body, context);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async endSession(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid session ID' });
            }
            const result = await KioskRegistrationService.endSession(id, req.body.status || 'Completed', context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 3. Business Card OCR Scanning
    // ==========================================
    async uploadScan(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await KioskRegistrationService.uploadCardScan(req.body, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 4. Guest Profile Photo Capture
    // ==========================================
    async uploadPhoto(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await KioskRegistrationService.uploadGuestPhoto(req.body, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 5. Complete Self-Service Registration Workflow
    // ==========================================
    async register(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await KioskRegistrationService.registerGuest(req.body, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 6. Concierge Assistance Paging
    // ==========================================
    async assist(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await KioskRegistrationService.requestAssistance(req.body, context);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 7. Multi-Language Support
    // ==========================================
    async listLanguages(req, res, next) {
        try {
            const result = await KioskRegistrationService.listLanguages();
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async saveLanguage(req, res, next) {
        try {
            const result = await KioskRegistrationService.saveLanguage(req.body);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 8. Registration Queue Management
    // ==========================================
    async getQueue(req, res, next) {
        try {
            const context = this._getContext(req);
            const result = await KioskRegistrationService.getQueue(context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async updateQueueItem(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid queue ID' });
            }
            const result = await KioskRegistrationService.updateQueueItem(id, req.body, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async removeFromQueue(req, res, next) {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid queue ID' });
            }
            await KioskRegistrationService.removeFromQueue(id, context);
            res.status(200).json({ success: true, message: 'Queue entry removed successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new KioskRegistrationController();
