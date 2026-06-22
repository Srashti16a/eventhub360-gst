const pool = require('../config/db');

class RsvpAnalyticsRepository {
    /**
     * Get summary counts for RSVPs (total invitations, accepted, declined, pending)
     * @param {number} eventId 
     * @param {number} companyId 
     * @returns {Promise<Object>}
     */
    async getSummary(eventId, companyId) {
        const query = `
            SELECT 
                COALESCE(COUNT(eg.event_guest_id), 0)::INTEGER as total_invitations,
                COALESCE(COUNT(CASE WHEN r.status IN ('yes', 'Accepted') THEN 1 END), 0)::INTEGER as accepted,
                COALESCE(COUNT(CASE WHEN r.status IN ('no', 'Declined') THEN 1 END), 0)::INTEGER as declined,
                COALESCE(COUNT(CASE WHEN r.status IS NULL OR r.status IN ('maybe', 'Pending') THEN 1 END), 0)::INTEGER as pending
            FROM event_guest eg
            JOIN guest g ON eg.guest_id = g.guest_id
            LEFT JOIN rsvp r ON eg.event_guest_id = r.event_guest_id
            WHERE eg.event_id = $1 AND g.company_id = $2;
        `;
        const result = await pool.query(query, [eventId, companyId]);
        return result.rows[0];
    }

    /**
     * Get daily responses timeline trends
     * @param {number} eventId 
     * @param {number} companyId 
     * @returns {Promise<Array<Object>>}
     */
    async getTrends(eventId, companyId) {
        const query = `
            SELECT 
                DATE_TRUNC('day', r.responded_at)::DATE as response_date,
                COALESCE(COUNT(CASE WHEN r.status IN ('yes', 'Accepted') THEN 1 END), 0)::INTEGER as accepted_count,
                COALESCE(COUNT(CASE WHEN r.status IN ('no', 'Declined') THEN 1 END), 0)::INTEGER as declined_count,
                COALESCE(COUNT(r.rsvp_id), 0)::INTEGER as total_responses
            FROM event_guest eg
            JOIN guest g ON eg.guest_id = g.guest_id
            JOIN rsvp r ON eg.event_guest_id = r.event_guest_id
            WHERE eg.event_id = $1 AND g.company_id = $2 AND r.responded_at IS NOT NULL
            GROUP BY response_date
            ORDER BY response_date ASC;
        `;
        const result = await pool.query(query, [eventId, companyId]);
        return result.rows;
    }

    /**
     * Get guest category breakdown statistics
     * @param {number} eventId 
     * @param {number} companyId 
     * @returns {Promise<Array<Object>>}
     */
    async getCategoryBreakdown(eventId, companyId) {
        const query = `
            SELECT 
                COALESCE(g.category, 'General') as category,
                COALESCE(COUNT(eg.event_guest_id), 0)::INTEGER as total_invited,
                COALESCE(COUNT(CASE WHEN r.status IN ('yes', 'Accepted') THEN 1 END), 0)::INTEGER as accepted,
                COALESCE(COUNT(CASE WHEN r.status IN ('no', 'Declined') THEN 1 END), 0)::INTEGER as declined,
                COALESCE(COUNT(CASE WHEN r.status IS NULL OR r.status IN ('maybe', 'Pending') THEN 1 END), 0)::INTEGER as pending
            FROM event_guest eg
            JOIN guest g ON eg.guest_id = g.guest_id
            LEFT JOIN rsvp r ON eg.event_guest_id = r.event_guest_id
            WHERE eg.event_id = $1 AND g.company_id = $2
            GROUP BY g.category
            ORDER BY total_invited DESC;
        `;
        const result = await pool.query(query, [eventId, companyId]);
        return result.rows;
    }

    /**
     * Get recent responses for feed activity
     * @param {number} eventId 
     * @param {number} companyId 
     * @param {number} limit 
     * @returns {Promise<Array<Object>>}
     */
    async getTimeline(eventId, companyId, limit = 5) {
        const query = `
            SELECT 
                g.name as guest_name,
                COALESCE(g.category, 'General') as guest_category,
                r.status as rsvp_status,
                r.responded_at,
                eg.invited
            FROM event_guest eg
            JOIN guest g ON eg.guest_id = g.guest_id
            LEFT JOIN rsvp r ON eg.event_guest_id = r.event_guest_id
            WHERE eg.event_id = $1 AND g.company_id = $2
            ORDER BY COALESCE(r.responded_at, eg.created_at) DESC
            LIMIT $3;
        `;
        const result = await pool.query(query, [eventId, companyId, limit]);
        return result.rows;
    }

    /**
     * Get searchable and filterable list of detailed guest responses
     */
    async getResponsesList(eventId, companyId, { category, search, limit = 10, offset = 0 }) {
        let query = `
            SELECT 
                g.name as guest_name,
                g.phone as guest_phone,
                COALESCE(g.category, 'General') as guest_category,
                COALESCE(r.status, 'Pending') as rsvp_status,
                r.responded_at as response_date
            FROM event_guest eg
            JOIN guest g ON eg.guest_id = g.guest_id
            LEFT JOIN rsvp r ON eg.event_guest_id = r.event_guest_id
            WHERE eg.event_id = $1 AND g.company_id = $2
        `;
        const values = [eventId, companyId];
        let paramCount = 2;

        if (category) {
            paramCount++;
            query += ` AND g.category = $${paramCount}`;
            values.push(category);
        }

        if (search) {
            paramCount++;
            query += ` AND g.name ILIKE $${paramCount}`;
            values.push(`%${search}%`);
        }

        paramCount++;
        query += ` ORDER BY r.responded_at DESC NULLS LAST, g.name ASC LIMIT $${paramCount}`;
        values.push(limit);

        paramCount++;
        query += ` OFFSET $${paramCount}`;
        values.push(offset);

        const result = await pool.query(query, values);
        return result.rows;
    }

    /**
     * Get count of filtered responses for pagination total
     */
    async getResponsesCount(eventId, companyId, { category, search }) {
        let query = `
            SELECT COUNT(*) as total
            FROM event_guest eg
            JOIN guest g ON eg.guest_id = g.guest_id
            LEFT JOIN rsvp r ON eg.event_guest_id = r.event_guest_id
            WHERE eg.event_id = $1 AND g.company_id = $2
        `;
        const values = [eventId, companyId];
        let paramCount = 2;

        if (category) {
            paramCount++;
            query += ` AND g.category = $${paramCount}`;
            values.push(category);
        }

        if (search) {
            paramCount++;
            query += ` AND g.name ILIKE $${paramCount}`;
            values.push(`%${search}%`);
        }

        const result = await pool.query(query, values);
        return parseInt(result.rows[0].total, 10);
    }
}

module.exports = new RsvpAnalyticsRepository();
