const pool = require('../config/db');
const Campaign = require('./Campaign');
const CampaignRecipient = require('./CampaignRecipient');
const BroadcastSchedule = require('./BroadcastSchedule');
const NotificationQueue = require('./NotificationQueue');

class CampaignRepository {
    // ==========================================
    // 1. Campaigns
    // ==========================================
    async createCampaign(data, client = pool) {
        const query = `
            INSERT INTO campaigns (company_id, branch_id, event_id, name, channel, template_id, segment_id, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.branch_id || null,
            data.event_id,
            data.name,
            data.channel,
            data.template_id || null,
            data.segment_id || null,
            data.status || 'Draft'
        ]);
        return Campaign.fromRow(result.rows[0]);
    }

    async findCampaignById(id, companyId) {
        const query = `
            SELECT c.*, e.event_name, t.name as template_name, s.name as segment_name
            FROM campaigns c
            JOIN events e ON c.event_id = e.event_id
            LEFT JOIN communication_templates t ON c.template_id = t.id
            LEFT JOIN audience_segments s ON c.segment_id = s.id
            WHERE c.id = $1 AND c.company_id = $2;
        `;
        const result = await pool.query(query, [id, companyId]);
        return Campaign.fromRow(result.rows[0]);
    }

    async findAllCampaigns(companyId, { page = 1, limit = 10, search, channel, status } = {}) {
        const offset = (page - 1) * limit;
        let query = `
            SELECT c.*, e.event_name, t.name as template_name, s.name as segment_name
            FROM campaigns c
            JOIN events e ON c.event_id = e.event_id
            LEFT JOIN communication_templates t ON c.template_id = t.id
            LEFT JOIN audience_segments s ON c.segment_id = s.id
            WHERE c.company_id = $1
        `;
        const values = [companyId];
        let paramCount = 1;

        if (search) {
            paramCount++;
            query += ` AND c.name ILIKE $${paramCount}`;
            values.push(`%${search}%`);
        }
        if (channel) {
            paramCount++;
            query += ` AND c.channel = $${paramCount}`;
            values.push(channel);
        }
        if (status) {
            paramCount++;
            query += ` AND c.status = $${paramCount}`;
            values.push(status);
        }

        paramCount++;
        query += ` ORDER BY c.created_at DESC LIMIT $${paramCount}`;
        values.push(limit);

        paramCount++;
        query += ` OFFSET $${paramCount}`;
        values.push(offset);

        const result = await pool.query(query, values);
        return result.rows.map(row => Campaign.fromRow(row));
    }

    async countCampaigns(companyId, { search, channel, status } = {}) {
        let query = `
            SELECT COUNT(*)::INTEGER
            FROM campaigns c
            WHERE c.company_id = $1
        `;
        const values = [companyId];
        let paramCount = 1;

        if (search) {
            paramCount++;
            query += ` AND c.name ILIKE $${paramCount}`;
            values.push(`%${search}%`);
        }
        if (channel) {
            paramCount++;
            query += ` AND c.channel = $${paramCount}`;
            values.push(channel);
        }
        if (status) {
            paramCount++;
            query += ` AND c.status = $${paramCount}`;
            values.push(status);
        }

        const result = await pool.query(query, values);
        return result.rows[0].count;
    }

    async updateCampaign(id, companyId, data, client = pool) {
        const setFields = [];
        const values = [id, companyId];
        let paramCount = 2;

        const fields = ['name', 'template_id', 'segment_id', 'status'];
        for (const field of fields) {
            if (data[field] !== undefined) {
                paramCount++;
                setFields.push(`${field} = $${paramCount}`);
                values.push(data[field]);
            }
        }

        if (setFields.length === 0) {
            return this.findCampaignById(id, companyId);
        }

        setFields.push(`updated_at = NOW()`);
        const query = `
            UPDATE campaigns
            SET ${setFields.join(', ')}
            WHERE id = $1 AND company_id = $2
            RETURNING *;
        `;
        const result = await client.query(query, values);
        return Campaign.fromRow(result.rows[0]);
    }

    // ==========================================
    // 2. Broadcast Schedules
    // ==========================================
    async createSchedule(data, client = pool) {
        const query = `
            INSERT INTO broadcast_schedules (campaign_id, scheduled_time, status)
            VALUES ($1, $2, 'Pending')
            ON CONFLICT DO NOTHING
            RETURNING *;
        `;
        const result = await client.query(query, [data.campaign_id, data.scheduled_time]);
        return BroadcastSchedule.fromRow(result.rows[0]);
    }

    async updateScheduleStatus(id, status, client = pool) {
        const query = `
            UPDATE broadcast_schedules
            SET status = $1
            WHERE id = $2
            RETURNING *;
        `;
        const result = await client.query(query, [status, id]);
        return BroadcastSchedule.fromRow(result.rows[0]);
    }

    async getPendingSchedules() {
        const query = `
            SELECT s.*, c.name as campaign_name, c.channel
            FROM broadcast_schedules s
            JOIN campaigns c ON s.campaign_id = c.id
            WHERE s.status = 'Pending' AND s.scheduled_time <= NOW();
        `;
        const result = await pool.query(query);
        return result.rows.map(row => BroadcastSchedule.fromRow(row));
    }

    // ==========================================
    // 3. Campaign Recipients
    // ==========================================
    async addCampaignRecipient(data, client = pool) {
        const query = `
            INSERT INTO campaign_recipients (campaign_id, guest_id, delivery_status)
            VALUES ($1, $2, 'Pending')
            RETURNING *;
        `;
        const result = await client.query(query, [data.campaign_id, data.guest_id]);
        return CampaignRecipient.fromRow(result.rows[0]);
    }

    async updateRecipientStatus(campaignId, guestId, status, errorMsg = null, client = pool) {
        const query = `
            UPDATE campaign_recipients
            SET delivery_status = $1, error_message = $2,
                sent_at = CASE WHEN $1::VARCHAR = 'Sent' THEN NOW() ELSE sent_at END,
                opened_at = CASE WHEN $1::VARCHAR = 'Opened' THEN NOW() ELSE opened_at END,
                clicked_at = CASE WHEN $1::VARCHAR = 'Clicked' THEN NOW() ELSE clicked_at END
            WHERE campaign_id = $3 AND guest_id = $4
            RETURNING *;
        `;
        const result = await client.query(query, [status, errorMsg, campaignId, guestId]);
        return CampaignRecipient.fromRow(result.rows[0]);
    }

    async updateRecipientStatusById(id, status, errorMsg = null, client = pool) {
        const query = `
            UPDATE campaign_recipients
            SET delivery_status = $1, error_message = $2,
                sent_at = CASE WHEN $1::VARCHAR = 'Sent' THEN NOW() ELSE sent_at END,
                opened_at = CASE WHEN $1::VARCHAR = 'Opened' THEN NOW() ELSE opened_at END,
                clicked_at = CASE WHEN $1::VARCHAR = 'Clicked' THEN NOW() ELSE clicked_at END
            WHERE id = $3
            RETURNING *;
        `;
        const result = await client.query(query, [status, errorMsg, id]);
        return CampaignRecipient.fromRow(result.rows[0]);
    }

    async findRecipientById(id) {
        const query = `SELECT * FROM campaign_recipients WHERE id = $1;`;
        const result = await pool.query(query, [id]);
        return CampaignRecipient.fromRow(result.rows[0]);
    }

    async findAllRecipients(campaignId, { page = 1, limit = 10 } = {}) {
        const offset = (page - 1) * limit;
        const query = `
            SELECT r.*, g.name as guest_name, g.email as guest_email, g.phone as guest_phone
            FROM campaign_recipients r
            JOIN guest g ON r.guest_id = g.guest_id
            WHERE r.campaign_id = $1
            ORDER BY g.name ASC
            LIMIT $2 OFFSET $3;
        `;
        const result = await pool.query(query, [campaignId, limit, offset]);
        return result.rows.map(row => CampaignRecipient.fromRow(row));
    }

    async countRecipients(campaignId) {
        const query = `SELECT COUNT(*)::INTEGER FROM campaign_recipients WHERE campaign_id = $1;`;
        const result = await pool.query(query, [campaignId]);
        return result.rows[0].count;
    }

    // ==========================================
    // 4. Notification Queues
    // ==========================================
    async enqueueNotification(data, client = pool) {
        const query = `
            INSERT INTO notification_queues (company_id, campaign_id, guest_id, channel, recipient_address, subject, body, status, priority)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending', $8)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.campaign_id || null,
            data.guest_id,
            data.channel,
            data.recipient_address,
            data.subject || null,
            data.body,
            data.priority || 1
        ]);
        return NotificationQueue.fromRow(result.rows[0]);
    }

    async getPendingNotifications(limit = 10, client = pool) {
        const query = `
            SELECT n.*, c.name as campaign_name, g.name as guest_name
            FROM notification_queues n
            LEFT JOIN campaigns c ON n.campaign_id = c.id
            JOIN guest g ON n.guest_id = g.guest_id
            WHERE n.status = 'Pending'
            ORDER BY n.priority DESC, n.created_at ASC
            LIMIT $1;
        `;
        const result = await client.query(query, [limit]);
        return result.rows.map(row => NotificationQueue.fromRow(row));
    }

    async updateNotificationStatus(id, status, client = pool) {
        const query = `
            UPDATE notification_queues
            SET status = $1
            WHERE id = $2;
        `;
        await client.query(query, [status, id]);
    }

    // ==========================================
    // 5. Analytics Queries
    // ==========================================
    async getCampaignDeliveryRates(campaignId) {
        const query = `
            SELECT 
                COUNT(id)::INTEGER as total,
                COALESCE(COUNT(CASE WHEN delivery_status IN ('Sent', 'Delivered', 'Opened', 'Clicked') THEN 1 END), 0)::INTEGER as sent,
                COALESCE(COUNT(CASE WHEN delivery_status IN ('Delivered', 'Opened', 'Clicked') THEN 1 END), 0)::INTEGER as delivered,
                COALESCE(COUNT(CASE WHEN delivery_status = 'Opened' OR delivery_status = 'Clicked' THEN 1 END), 0)::INTEGER as opened,
                COALESCE(COUNT(CASE WHEN delivery_status = 'Clicked' THEN 1 END), 0)::INTEGER as clicked,
                COALESCE(COUNT(CASE WHEN delivery_status = 'Failed' THEN 1 END), 0)::INTEGER as failed
            FROM campaign_recipients
            WHERE campaign_id = $1;
        `;
        const result = await pool.query(query, [campaignId]);
        return result.rows[0];
    }
}

module.exports = new CampaignRepository();
