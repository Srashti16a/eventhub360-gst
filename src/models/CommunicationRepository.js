const pool = require('../config/db');
const CommunicationTemplate = require('./CommunicationTemplate');
const AudienceSegment = require('./AudienceSegment');
const SegmentMember = require('./SegmentMember');
const CommunicationLog = require('./CommunicationLog');
const ChannelAnalytics = require('./ChannelAnalytics');
const OptOutPreference = require('./OptOutPreference');

class CommunicationRepository {
    // ==========================================
    // 1. Templates
    // ==========================================
    async createTemplate(data, client = pool) {
        const query = `
            INSERT INTO communication_templates (company_id, branch_id, name, channel, subject, content, variables, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.branch_id || null,
            data.name,
            data.channel,
            data.subject || null,
            data.content,
            JSON.stringify(data.variables || []),
            data.is_active !== undefined ? data.is_active : true
        ]);
        return CommunicationTemplate.fromRow(result.rows[0]);
    }

    async findTemplateById(id, companyId) {
        const query = `SELECT * FROM communication_templates WHERE id = $1 AND company_id = $2;`;
        const result = await pool.query(query, [id, companyId]);
        return CommunicationTemplate.fromRow(result.rows[0]);
    }

    async findAllTemplates(companyId, { channel } = {}) {
        let query = `SELECT * FROM communication_templates WHERE company_id = $1`;
        const values = [companyId];
        if (channel) {
            query += ` AND channel = $2`;
            values.push(channel);
        }
        query += ` ORDER BY name ASC;`;
        const result = await pool.query(query, values);
        return result.rows.map(row => CommunicationTemplate.fromRow(row));
    }

    async updateTemplate(id, companyId, data, client = pool) {
        const setFields = [];
        const values = [id, companyId];
        let paramCount = 2;

        const fields = ['name', 'subject', 'content', 'variables', 'is_active'];
        for (const field of fields) {
            if (data[field] !== undefined) {
                paramCount++;
                setFields.push(`${field} = $${paramCount}`);
                if (field === 'variables') {
                    values.push(JSON.stringify(data[field]));
                } else {
                    values.push(data[field]);
                }
            }
        }

        if (setFields.length === 0) {
            return this.findTemplateById(id, companyId);
        }

        setFields.push(`updated_at = NOW()`);
        const query = `
            UPDATE communication_templates
            SET ${setFields.join(', ')}
            WHERE id = $1 AND company_id = $2
            RETURNING *;
        `;
        const result = await client.query(query, values);
        return CommunicationTemplate.fromRow(result.rows[0]);
    }

    async deleteTemplate(id, companyId, client = pool) {
        const query = `DELETE FROM communication_templates WHERE id = $1 AND company_id = $2;`;
        const result = await client.query(query, [id, companyId]);
        return result.rowCount > 0;
    }

    // ==========================================
    // 2. Audience Segments
    // ==========================================
    async createSegment(data, client = pool) {
        const query = `
            INSERT INTO audience_segments (company_id, name, description, rules)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.name,
            data.description || null,
            JSON.stringify(data.rules || {})
        ]);
        return AudienceSegment.fromRow(result.rows[0]);
    }

    async findSegmentById(id, companyId) {
        const query = `SELECT * FROM audience_segments WHERE id = $1 AND company_id = $2;`;
        const result = await pool.query(query, [id, companyId]);
        return AudienceSegment.fromRow(result.rows[0]);
    }

    async findAllSegments(companyId) {
        const query = `SELECT * FROM audience_segments WHERE company_id = $1 ORDER BY name ASC;`;
        const result = await pool.query(query, [companyId]);
        return result.rows.map(row => AudienceSegment.fromRow(row));
    }

    async deleteSegment(id, companyId, client = pool) {
        const query = `DELETE FROM audience_segments WHERE id = $1 AND company_id = $2;`;
        const result = await client.query(query, [id, companyId]);
        return result.rowCount > 0;
    }

    // ==========================================
    // 3. Segment Members
    // ==========================================
    async addSegmentMember(segmentId, guestId, client = pool) {
        const query = `
            INSERT INTO segment_members (segment_id, guest_id)
            VALUES ($1, $2)
            ON CONFLICT (segment_id, guest_id) DO NOTHING;
        `;
        await client.query(query, [segmentId, guestId]);
    }

    async clearSegmentMembers(segmentId, client = pool) {
        await client.query(`DELETE FROM segment_members WHERE segment_id = $1;`, [segmentId]);
    }

    async getSegmentMembers(segmentId) {
        const query = `
            SELECT m.*, g.name as guest_name, g.email as guest_email, g.phone as guest_phone, g.category as guest_category
            FROM segment_members m
            JOIN guest g ON m.guest_id = g.guest_id
            WHERE m.segment_id = $1
            ORDER BY g.name ASC;
        `;
        const result = await pool.query(query, [segmentId]);
        return result.rows.map(row => SegmentMember.fromRow(row));
    }

    // ==========================================
    // 4. Opt Out Preferences
    // ==========================================
    async saveOptOutPreference(data, client = pool) {
        const query = `
            INSERT INTO opt_out_preferences (company_id, guest_id, channel, opt_out)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (company_id, guest_id, channel) DO UPDATE
            SET opt_out = EXCLUDED.opt_out, updated_at = NOW()
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.guest_id,
            data.channel,
            data.opt_out !== undefined ? data.opt_out : true
        ]);
        return OptOutPreference.fromRow(result.rows[0]);
    }

    async checkOptOut(companyId, guestId, channel) {
        const query = `
            SELECT * FROM opt_out_preferences
            WHERE company_id = $1 AND guest_id = $2 AND (channel = $3 OR channel = 'All') AND opt_out = TRUE;
        `;
        const result = await pool.query(query, [companyId, guestId, channel]);
        return result.rows.length > 0;
    }

    // ==========================================
    // 5. Communication Logs
    // ==========================================
    async createLog(data, client = pool) {
        const query = `
            INSERT INTO communication_logs (company_id, campaign_id, guest_id, channel, recipient_address, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.campaign_id || null,
            data.guest_id,
            data.channel,
            data.recipient_address,
            data.status || 'Sent'
        ]);
        return CommunicationLog.fromRow(result.rows[0]);
    }

    async getLogs(companyId, { page = 1, limit = 10, channel, status } = {}) {
        const offset = (page - 1) * limit;
        let query = `
            SELECT l.*, c.name as campaign_name, g.name as guest_name
            FROM communication_logs l
            LEFT JOIN campaigns c ON l.campaign_id = c.id
            JOIN guest g ON l.guest_id = g.guest_id
            WHERE l.company_id = $1
        `;
        const values = [companyId];
        let paramCount = 1;

        if (channel) {
            paramCount++;
            query += ` AND l.channel = $${paramCount}`;
            values.push(channel);
        }
        if (status) {
            paramCount++;
            query += ` AND l.status = $${paramCount}`;
            values.push(status);
        }

        paramCount++;
        query += ` ORDER BY l.sent_at DESC LIMIT $${paramCount}`;
        values.push(limit);

        paramCount++;
        query += ` OFFSET $${paramCount}`;
        values.push(offset);

        const result = await pool.query(query, values);
        return result.rows.map(row => CommunicationLog.fromRow(row));
    }

    async countLogs(companyId, { channel, status } = {}) {
        let query = `SELECT COUNT(*)::INTEGER FROM communication_logs l WHERE l.company_id = $1`;
        const values = [companyId];
        let paramCount = 1;

        if (channel) {
            paramCount++;
            query += ` AND l.channel = $${paramCount}`;
            values.push(channel);
        }
        if (status) {
            paramCount++;
            query += ` AND l.status = $${paramCount}`;
            values.push(status);
        }

        const result = await pool.query(query, values);
        return result.rows[0].count;
    }

    // ==========================================
    // 6. Channel Performance Analytics
    // ==========================================
    async incrementChannelAnalytics(companyId, channel, metric, count = 1, client = pool) {
        const validMetrics = ['total_sent', 'total_delivered', 'total_opened', 'total_clicked', 'total_failed'];
        if (!validMetrics.includes(metric)) {
            throw new Error(`Invalid analytics metric key: ${metric}`);
        }

        const query = `
            INSERT INTO channel_analytics (company_id, channel, ${metric}, updated_at)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (company_id, channel) DO UPDATE
            SET ${metric} = channel_analytics.${metric} + $3, updated_at = NOW()
            RETURNING *;
        `;
        const result = await client.query(query, [companyId, channel, count]);
        return ChannelAnalytics.fromRow(result.rows[0]);
    }

    async getChannelAnalyticsList(companyId) {
        const query = `SELECT * FROM channel_analytics WHERE company_id = $1 ORDER BY channel ASC;`;
        const result = await pool.query(query, [companyId]);
        return result.rows.map(row => ChannelAnalytics.fromRow(row));
    }

    // ==========================================
    // 7. Dynamic Segment Resolution Criteria check
    // ==========================================
    async resolveGuestsBySegmentCriteria(companyId, rules) {
        // rules layout segment filtering criteria, e.g. {"category": "VIP"}
        let query = `SELECT * FROM guest WHERE company_id = $1`;
        const values = [companyId];
        let paramCount = 1;

        if (rules && rules.category) {
            paramCount++;
            query += ` AND category = $${paramCount}`;
            values.push(rules.category);
        }
        if (rules && rules.company) {
            paramCount++;
            query += ` AND company ILIKE $${paramCount}`;
            values.push(`%${rules.company}%`);
        }

        const result = await pool.query(query, values);
        return result.rows;
    }
}

module.exports = new CommunicationRepository();
