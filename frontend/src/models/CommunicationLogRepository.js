const pool = require('../config/db');
const MessageDeliveryLog = require('./MessageDeliveryLog');
const GatewayFailure = require('./GatewayFailure');
const RetryHistory = require('./RetryHistory');
const TrafficReroute = require('./TrafficReroute');
const CommunicationLatency = require('./CommunicationLatency');
const AutomationAlert = require('./AutomationAlert');

class CommunicationLogRepository {
    // ==========================================
    // 1. Message Delivery Logs
    // ==========================================
    async createDeliveryLog(data, client = pool) {
        const query = `
            INSERT INTO message_delivery_logs (company_id, campaign_id, guest_id, channel, recipient_address, status, delivery_result, sent_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.campaign_id || null,
            data.guest_id,
            data.channel,
            data.recipient_address,
            data.status || 'Pending',
            data.delivery_result || null,
            data.sent_at || null
        ]);
        return MessageDeliveryLog.fromRow(result.rows[0]);
    }

    async findDeliveryLogById(id, companyId) {
        const query = `
            SELECT l.*, g.name as guest_name, c.name as campaign_name
            FROM message_delivery_logs l
            JOIN guest g ON l.guest_id = g.guest_id
            LEFT JOIN campaigns c ON l.campaign_id = c.id
            WHERE l.id = $1 AND l.company_id = $2;
        `;
        const result = await pool.query(query, [id, companyId]);
        return MessageDeliveryLog.fromRow(result.rows[0]);
    }

    async findAllDeliveryLogs(companyId, { page = 1, limit = 10, search, channel, status, startDate, endDate } = {}) {
        const offset = (page - 1) * limit;
        let query = `
            SELECT l.*, g.name as guest_name, c.name as campaign_name
            FROM message_delivery_logs l
            JOIN guest g ON l.guest_id = g.guest_id
            LEFT JOIN campaigns c ON l.campaign_id = c.id
            WHERE l.company_id = $1
        `;
        const values = [companyId];
        let paramCount = 1;

        if (search) {
            paramCount++;
            query += ` AND (l.recipient_address ILIKE $${paramCount} OR g.name ILIKE $${paramCount} OR c.name ILIKE $${paramCount})`;
            values.push(`%${search}%`);
        }
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
        if (startDate) {
            paramCount++;
            query += ` AND l.created_at >= $${paramCount}`;
            values.push(startDate);
        }
        if (endDate) {
            paramCount++;
            query += ` AND l.created_at <= $${paramCount}`;
            values.push(endDate);
        }

        paramCount++;
        query += ` ORDER BY l.created_at DESC LIMIT $${paramCount}`;
        values.push(limit);

        paramCount++;
        query += ` OFFSET $${paramCount}`;
        values.push(offset);

        const result = await pool.query(query, values);
        return result.rows.map(row => MessageDeliveryLog.fromRow(row));
    }

    async countDeliveryLogs(companyId, { search, channel, status, startDate, endDate } = {}) {
        let query = `
            SELECT COUNT(*)::INTEGER
            FROM message_delivery_logs l
            JOIN guest g ON l.guest_id = g.guest_id
            LEFT JOIN campaigns c ON l.campaign_id = c.id
            WHERE l.company_id = $1
        `;
        const values = [companyId];
        let paramCount = 1;

        if (search) {
            paramCount++;
            query += ` AND (l.recipient_address ILIKE $${paramCount} OR g.name ILIKE $${paramCount} OR c.name ILIKE $${paramCount})`;
            values.push(`%${search}%`);
        }
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
        if (startDate) {
            paramCount++;
            query += ` AND l.created_at >= $${paramCount}`;
            values.push(startDate);
        }
        if (endDate) {
            paramCount++;
            query += ` AND l.created_at <= $${paramCount}`;
            values.push(endDate);
        }

        const result = await pool.query(query, values);
        return result.rows[0].count;
    }

    async updateDeliveryLogStatus(id, companyId, status, deliveryResult, dates = {}, client = pool) {
        const setFields = ['status = $1', 'delivery_result = $2', 'updated_at = NOW()'];
        const values = [status, deliveryResult, id, companyId];
        let paramCount = 4;

        if (dates.sent_at) {
            paramCount++;
            setFields.push(`sent_at = $${paramCount}`);
            values.push(dates.sent_at);
        }
        if (dates.delivered_at) {
            paramCount++;
            setFields.push(`delivered_at = $${paramCount}`);
            values.push(dates.delivered_at);
        }
        if (dates.read_at) {
            paramCount++;
            setFields.push(`read_at = $${paramCount}`);
            values.push(dates.read_at);
        }

        const query = `
            UPDATE message_delivery_logs
            SET ${setFields.join(', ')}
            WHERE id = $3 AND company_id = $4
            RETURNING *;
        `;
        const result = await client.query(query, values);
        return MessageDeliveryLog.fromRow(result.rows[0]);
    }

    // ==========================================
    // 2. Gateway Failures
    // ==========================================
    async createGatewayFailure(data, client = pool) {
        const query = `
            INSERT INTO gateway_failures (company_id, log_id, gateway_name, error_code, error_message)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.log_id,
            data.gateway_name,
            data.error_code || null,
            data.error_message || null
        ]);
        return GatewayFailure.fromRow(result.rows[0]);
    }

    async getGatewayFailures(logId) {
        const query = `SELECT * FROM gateway_failures WHERE log_id = $1 ORDER BY failure_time ASC;`;
        const result = await pool.query(query, [logId]);
        return result.rows.map(row => GatewayFailure.fromRow(row));
    }

    // ==========================================
    // 3. Retry History
    // ==========================================
    async createRetryHistory(data, client = pool) {
        const query = `
            INSERT INTO retry_histories (company_id, log_id, retry_count, status, gateway_response)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.log_id,
            data.retry_count,
            data.status,
            data.gateway_response || null
        ]);
        return RetryHistory.fromRow(result.rows[0]);
    }

    async getRetryHistories(logId) {
        const query = `SELECT * FROM retry_histories WHERE log_id = $1 ORDER BY retry_time ASC;`;
        const result = await pool.query(query, [logId]);
        return result.rows.map(row => RetryHistory.fromRow(row));
    }

    // ==========================================
    // 4. Traffic Reroutes
    // ==========================================
    async createTrafficReroute(data, client = pool) {
        // Deactivate previous active reroutes for this channel
        await client.query(`
            UPDATE traffic_reroutes
            SET is_active = FALSE
            WHERE company_id = $1 AND channel = $2 AND is_active = TRUE;
        `, [data.company_id, data.channel]);

        const query = `
            INSERT INTO traffic_reroutes (company_id, channel, from_gateway, to_gateway, reroute_reason, is_active)
            VALUES ($1, $2, $3, $4, $5, TRUE)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.channel,
            data.from_gateway,
            data.to_gateway,
            data.reroute_reason || null
        ]);
        return TrafficReroute.fromRow(result.rows[0]);
    }

    async getLatestActiveReroute(companyId, channel) {
        const query = `
            SELECT * FROM traffic_reroutes
            WHERE company_id = $1 AND channel = $2 AND is_active = TRUE;
        `;
        const result = await pool.query(query, [companyId, channel]);
        return TrafficReroute.fromRow(result.rows[0]);
    }

    async getTrafficReroutes(companyId) {
        const query = `SELECT * FROM traffic_reroutes WHERE company_id = $1 ORDER BY rerouted_at DESC;`;
        const result = await pool.query(query, [companyId]);
        return result.rows.map(row => TrafficReroute.fromRow(row));
    }

    // ==========================================
    // 5. Communication Latencies
    // ==========================================
    async createLatencyLog(data, client = pool) {
        const query = `
            INSERT INTO communication_latencies (company_id, log_id, channel, queue_latency_ms, delivery_latency_ms, total_latency_ms)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.log_id,
            data.channel,
            data.queue_latency_ms || 0,
            data.delivery_latency_ms || 0,
            data.total_latency_ms || 0
        ]);
        return CommunicationLatency.fromRow(result.rows[0]);
    }

    async getLatencyLog(logId) {
        const query = `SELECT * FROM communication_latencies WHERE log_id = $1;`;
        const result = await pool.query(query, [logId]);
        return CommunicationLatency.fromRow(result.rows[0]);
    }

    // ==========================================
    // 6. Automation Alerts
    // ==========================================
    async createAutomationAlert(data, client = pool) {
        const query = `
            INSERT INTO automation_alerts (company_id, alert_type, severity, message, status)
            VALUES ($1, $2, $3, $4, 'Active')
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.alert_type,
            data.severity,
            data.message
        ]);
        return AutomationAlert.fromRow(result.rows[0]);
    }

    async getAutomationAlerts(companyId, status = 'Active') {
        const query = `
            SELECT * FROM automation_alerts
            WHERE company_id = $1 AND status = $2
            ORDER BY created_at DESC;
        `;
        const result = await pool.query(query, [companyId, status]);
        return result.rows.map(row => AutomationAlert.fromRow(row));
    }

    async updateAlertStatus(id, companyId, status, client = pool) {
        const query = `
            UPDATE automation_alerts
            SET status = $1, updated_at = NOW()
            WHERE id = $2 AND company_id = $3
            RETURNING *;
        `;
        const result = await client.query(query, [status, id, companyId]);
        return AutomationAlert.fromRow(result.rows[0]);
    }

    // ==========================================
    // 7. Dashboard Analytics
    // ==========================================
    async getDashboardAggregateStats(companyId) {
        // Total logs
        const totalQuery = `SELECT COUNT(*)::INTEGER FROM message_delivery_logs WHERE company_id = $1;`;
        const totalRes = await pool.query(totalQuery, [companyId]);
        const total = totalRes.rows[0].count || 0;

        // Successful deliveries percentage (Delivered or Read logs / total logs)
        const successQuery = `
            SELECT COUNT(*)::INTEGER FROM message_delivery_logs
            WHERE company_id = $1 AND status IN ('Delivered', 'Read');
        `;
        const successRes = await pool.query(successQuery, [companyId]);
        const successful = successRes.rows[0].count || 0;
        const successPct = total > 0 ? Number(((successful / total) * 100).toFixed(2)) : 0.0;

        // Active failures count
        const failuresQuery = `
            SELECT COUNT(*)::INTEGER FROM message_delivery_logs
            WHERE company_id = $1 AND status = 'Failed';
        `;
        const failuresRes = await pool.query(failuresQuery, [companyId]);
        const failures = failuresRes.rows[0].count || 0;

        // Average latency in seconds
        const latencyQuery = `
            SELECT AVG(total_latency_ms)::FLOAT FROM communication_latencies
            WHERE company_id = $1;
        `;
        const latencyRes = await pool.query(latencyQuery, [companyId]);
        const avgLatencyMs = latencyRes.rows[0].avg || 0;
        const avgLatencySec = Number((avgLatencyMs / 1000.0).toFixed(2));

        return {
            total_logs: total,
            successful_deliveries_pct: successPct,
            active_failures: failures,
            avg_latency_sec: avgLatencySec
        };
    }

    async getRecentFailuresCount(companyId, minutes = 15) {
        const query = `
            SELECT COUNT(*)::INTEGER FROM message_delivery_logs
            WHERE company_id = $1 AND status = 'Failed' AND updated_at >= NOW() - INTERVAL '1 minute' * $2;
        `;
        const result = await pool.query(query, [companyId, minutes]);
        return result.rows[0].count || 0;
    }
}

module.exports = new CommunicationLogRepository();
