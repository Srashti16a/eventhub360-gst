const RsvpAnalyticsService = require('../models/RsvpAnalyticsService');

class RsvpAnalyticsController {
    /**
     * Get summary metrics panel data
     */
    async getSummary(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const eventId = parseInt(req.params.eventId, 10);

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'X-Company-ID header is required and must be a valid integer' 
                });
            }

            const result = await RsvpAnalyticsService.getRsvpSummary(eventId, companyId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get daily response trends for chart plots
     */
    async getTrends(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const eventId = parseInt(req.params.eventId, 10);
            const range = req.query.range || 'weekly';

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'X-Company-ID header is required and must be a valid integer' 
                });
            }

            const result = await RsvpAnalyticsService.getRsvpTrends(eventId, companyId, range);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get response details per guest category
     */
    async getCategories(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const eventId = parseInt(req.params.eventId, 10);

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'X-Company-ID header is required and must be a valid integer' 
                });
            }

            const result = await RsvpAnalyticsService.getRsvpCategories(eventId, companyId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get recent actions feed timeline
     */
    async getTimeline(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const eventId = parseInt(req.params.eventId, 10);
            const limit = parseInt(req.query.limit || 5, 10);

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'X-Company-ID header is required and must be a valid integer' 
                });
            }

            const result = await RsvpAnalyticsService.getRsvpTimeline(eventId, companyId, limit);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get detailed, searchable and paginated response table rows
     */
    async getResponses(req, res, next) {
        try {
            const companyId = parseInt(req.headers['x-company-id'], 10);
            const eventId = parseInt(req.params.eventId, 10);
            const { category, search, page, limit } = req.query;

            if (!companyId || isNaN(companyId)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'X-Company-ID header is required and must be a valid integer' 
                });
            }

            const result = await RsvpAnalyticsService.getRecentResponses(eventId, companyId, {
                category,
                search,
                page: parseInt(page || 1, 10),
                limit: parseInt(limit || 10, 10)
            });
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new RsvpAnalyticsController();
