const TransportationService = require('../models/TransportationService');

class TransportationController {
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
    // 1. Dashboard Overview
    // ==========================================
    getDashboardOverview = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const eventId = parseInt(req.params.eventId, 10);
            if (isNaN(eventId)) {
                return res.status(400).json({ success: false, error: 'Invalid event ID' });
            }
            const result = await TransportationService.getDashboardOverview(eventId, context);
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
            const result = await TransportationService.triggerAnalyticsRefresh(eventId, context);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 2. Fleet Assignments
    // ==========================================
    assignFleet = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const result = await TransportationService.assignFleet(req.body, context);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    listAssignments = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const eventId = req.query.event_id ? parseInt(req.query.event_id, 10) : null;
            const result = await TransportationService.listAssignments(eventId, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    deleteAssignment = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid assignment ID' });
            }
            const result = await TransportationService.deleteAssignment(id, context);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 3. Driver & Vehicle Status Management
    // ==========================================
    updateDriverStatus = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid driver ID' });
            }
            const result = await TransportationService.updateDriverStatus(id, req.body.status, context);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    updateVehicleStatus = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid vehicle ID' });
            }
            const result = await TransportationService.updateVehicleStatus(id, req.body.status, context);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 4. Arrivals & Departures Scheduling
    // ==========================================
    scheduleTransfer = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const result = await TransportationService.scheduleTransfer(req.body, context);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            if (error.status === 409) {
                return res.status(409).json({ success: false, error: error.message });
            }
            next(error);
        }
    }

    listTransfers = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const eventId = req.query.event_id ? parseInt(req.query.event_id, 10) : null;
            const result = await TransportationService.listTransfers(eventId, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    getTransferDetails = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid transfer ID' });
            }
            const result = await TransportationService.getTransferDetails(id, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    updateTransfer = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid transfer ID' });
            }
            const result = await TransportationService.updateTransfer(id, req.body, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            if (error.message.includes('Conflict Detected')) {
                return res.status(409).json({ success: false, error: error.message });
            }
            next(error);
        }
    }

    deleteTransfer = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid transfer ID' });
            }
            await TransportationService.deleteTransfer(id, context);
            res.status(200).json({ success: true, message: 'Transfer schedule deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 5. Routes Management
    // ==========================================
    createRoute = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const result = await TransportationService.createRoute(req.body, context);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    listRoutes = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const result = await TransportationService.listRoutes(context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    optimizeRoute = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid route ID' });
            }
            const result = await TransportationService.optimizeRoute(id, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 6. Vehicle Maintenance
    // ==========================================
    scheduleMaintenance = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const result = await TransportationService.scheduleMaintenance(req.body, context);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    listMaintenances = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const vehicleId = req.query.vehicle_id ? parseInt(req.query.vehicle_id, 10) : null;
            const result = await TransportationService.listMaintenances(vehicleId, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    updateMaintenance = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, error: 'Invalid maintenance ID' });
            }
            const result = await TransportationService.updateMaintenance(id, req.body, context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // 7. Activity Logs
    // ==========================================
    listActivityLogs = async (req, res, next) => {
        try {
            const context = this._getContext(req);
            const result = await TransportationService.listActivityLogs(context);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TransportationController();
