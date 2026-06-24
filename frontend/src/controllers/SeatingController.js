const SeatingService = require('../models/SeatingService');

class SeatingController {
    /**
     * Get dashboard metrics counts
     */
    async getDashboard(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const eventId = parseInt(req.query.event_id, 10);

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required and must be an integer' });
            }
            if (!eventId || isNaN(eventId)) {
                return res.status(400).json({ success: false, error: 'event_id query parameter is required and must be an integer' });
            }

            const data = await SeatingService.getDashboardAnalytics(eventId, companyId);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get detailed table layout configuration
     */
    async getLayout(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const layoutId = parseInt(req.params.layoutId, 10);

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }
            if (!layoutId || isNaN(layoutId)) {
                return res.status(400).json({ success: false, error: 'layoutId path parameter is required' });
            }

            const data = await SeatingService.getLayoutDetails(layoutId, companyId);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create event table
     */
    async createTable(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }

            const table = await SeatingService.createTable(req.body, companyId);
            res.status(201).json({ success: true, message: 'Table created successfully', data: table });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Edit event table settings
     */
    async updateTable(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const tableId = parseInt(req.params.tableId, 10);

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }
            if (!tableId || isNaN(tableId)) {
                return res.status(400).json({ success: false, error: 'tableId is required' });
            }

            const table = await SeatingService.updateTable(tableId, req.body, companyId);
            res.status(200).json({ success: true, message: 'Table updated successfully', data: table });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Remove event table
     */
    async deleteTable(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const tableId = parseInt(req.params.tableId, 10);

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }
            if (!tableId || isNaN(tableId)) {
                return res.status(400).json({ success: false, error: 'tableId is required' });
            }

            const success = await SeatingService.deleteTable(tableId, companyId);
            if (success) {
                res.status(200).json({ success: true, message: 'Table deleted successfully' });
            } else {
                res.status(404).json({ success: false, error: 'Table not found or not deleted' });
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Save drag and drop positioning layout
     */
    async bulkUpdateTablePositions(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }

            await SeatingService.saveTablePositions(req.body.tables, companyId);
            res.status(200).json({ success: true, message: 'Table layout coordinates saved successfully' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Assign guest to seat
     */
    async assignGuest(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const userId = 1; // Simulated user ID audit context in standard middleware

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }

            const assignment = await SeatingService.assignGuestToSeat(req.body, companyId, userId);
            res.status(200).json({ success: true, message: 'Guest seated successfully', data: assignment });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Unseat guest
     */
    async removeAssignment(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const { layoutId, guestId } = req.params;

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }

            const success = await SeatingService.unassignGuest(Number(layoutId), Number(guestId), companyId);
            if (success) {
                res.status(200).json({ success: true, message: 'Guest unseated successfully' });
            } else {
                res.status(404).json({ success: false, error: 'Guest assignment not found' });
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Save general layout properties
     */
    async saveLayout(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const layoutId = parseInt(req.params.layoutId, 10);
            const userId = 1;

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }

            const layout = await SeatingService.saveLayoutSettings(layoutId, req.body, companyId, userId);
            res.status(200).json({ success: true, message: 'Layout details saved successfully', data: layout });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Versioning trigger duplicating layout version
     */
    async cloneLayoutVersion(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const userId = 1;

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }

            const layout = await SeatingService.createNewLayoutVersion(
                req.body.target_layout_id,
                req.body.new_version_name,
                companyId,
                userId
            );
            res.status(201).json({ success: true, message: 'New layout version cloned successfully', data: layout });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Run Rule Checker validating constraints
     */
    async runValidation(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const layoutId = parseInt(req.params.layoutId, 10);
            const eventId = parseInt(req.query.event_id, 10);

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ success: false, error: 'X-Company-ID header is required' });
            }
            if (!eventId || isNaN(eventId)) {
                return res.status(400).json({ success: false, error: 'event_id query parameter is required' });
            }

            const validation = await SeatingService.runLayoutRuleValidation(layoutId, eventId, companyId);
            res.status(200).json({ success: true, data: validation });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SeatingController();
