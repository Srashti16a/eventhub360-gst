const RsvpAnalyticsRepository = require('./RsvpAnalyticsRepository');
const {
    RsvpSummaryDTO,
    RsvpTrendDTO,
    RsvpCategoryBreakdownDTO,
    RsvpTimelineDTO,
    RsvpRecentResponseDTO
} = require('./RsvpAnalyticsDTO');

class RsvpAnalyticsService {
    /**
     * Fetch RSVP Summary counts and conversion rates
     */
    async getRsvpSummary(eventId, companyId) {
        const rawSummary = await RsvpAnalyticsRepository.getSummary(eventId, companyId);
        return new RsvpSummaryDTO(rawSummary);
    }

    /**
     * Fetch Daily Response trends for graph plots
     */
    async getRsvpTrends(eventId, companyId, queryRange = 'weekly') {
        const rows = await RsvpAnalyticsRepository.getTrends(eventId, companyId);
        const trends = rows.map(r => new RsvpTrendDTO(r));
        
        // Service level filtering for weekly/monthly subsets if necessary
        if (queryRange === 'weekly') {
            // Keep the last 7 items
            return trends.slice(-7);
        } else if (queryRange === 'monthly') {
            // Keep the last 30 items
            return trends.slice(-30);
        }
        return trends;
    }

    /**
     * Fetch breakdown statistics per guest category
     */
    async getRsvpCategories(eventId, companyId) {
        const rows = await RsvpAnalyticsRepository.getCategoryBreakdown(eventId, companyId);
        return rows.map(r => new RsvpCategoryBreakdownDTO(r));
    }

    /**
     * Fetch recent activity log feeds
     */
    async getRsvpTimeline(eventId, companyId, limit = 5) {
        const rows = await RsvpAnalyticsRepository.getTimeline(eventId, companyId, limit);
        return rows.map(r => new RsvpTimelineDTO(r));
    }

    /**
     * Fetch paginated detailed responses listing
     */
    async getRecentResponses(eventId, companyId, { category, search, page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        
        const [rows, total] = await Promise.all([
            RsvpAnalyticsRepository.getResponsesList(eventId, companyId, { category, search, limit, offset }),
            RsvpAnalyticsRepository.getResponsesCount(eventId, companyId, { category, search })
        ]);
        
        return {
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: rows.map(r => new RsvpRecentResponseDTO(r))
        };
    }
}

module.exports = new RsvpAnalyticsService();
