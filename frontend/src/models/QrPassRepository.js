const pool = require('../config/db');
const QrPass = require('./QrPass');
const QrPassDelivery = require('./QrPassDelivery');
const ScannerDevice = require('./ScannerDevice');
const PassScanLog = require('./PassScanLog');
const PassSecurityAudit = require('./PassSecurityAudit');
const BatchPassGeneration = require('./BatchPassGeneration');
const PassRevocationLog = require('./PassRevocationLog');

class QrPassRepository {
    // ==========================================
    // 1. QR Passes
    // ==========================================
    async getPassById(passId, companyId) {
        const query = `
            SELECT qp.*, g.name as guest_name, g.email as guest_email
            FROM qr_passes qp
            JOIN guest g ON qp.guest_id = g.guest_id
            WHERE qp.pass_id = $1 AND qp.company_id = $2;
        `;
        const result = await pool.query(query, [passId, companyId]);
        return QrPass.fromRow(result.rows[0]);
    }

    async getPassByCode(passCode, companyId) {
        const query = `
            SELECT qp.*, g.name as guest_name, g.email as guest_email
            FROM qr_passes qp
            JOIN guest g ON qp.guest_id = g.guest_id
            WHERE qp.pass_code = $1 AND qp.company_id = $2;
        `;
        const result = await pool.query(query, [passCode, companyId]);
        return QrPass.fromRow(result.rows[0]);
    }

    async createPass(data) {
        const query = `
            INSERT INTO qr_passes (company_id, branch_id, guest_id, pass_code, pass_type, status, qr_code_url, security_hash, expires_at, created_by, updated_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
        `;
        const values = [
            data.company_id,
            data.branch_id || null,
            data.guest_id,
            data.pass_code,
            data.pass_type,
            data.status || 'Active',
            data.qr_code_url || null,
            data.security_hash,
            data.expires_at,
            data.created_by || null,
            data.updated_by || null
        ];
        const result = await pool.query(query, values);
        return QrPass.fromRow(result.rows[0]);
    }

    async updatePassStatus(passId, status, companyId) {
        const query = `
            UPDATE qr_passes 
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE pass_id = $2 AND company_id = $3
            RETURNING *;
        `;
        const result = await pool.query(query, [status, passId, companyId]);
        return QrPass.fromRow(result.rows[0]);
    }

    async getPassesList(eventId, companyId, { page = 1, limit = 10, search, pass_type, status }) {
        const offset = (page - 1) * limit;
        let query = `
            SELECT qp.*, g.name as guest_name, g.email as guest_email
            FROM qr_passes qp
            JOIN guest g ON qp.guest_id = g.guest_id
            JOIN event_guest eg ON g.guest_id = eg.guest_id
            WHERE eg.event_id = $1 AND qp.company_id = $2
        `;
        const values = [eventId, companyId];
        let paramCount = 2;

        if (search) {
            paramCount++;
            query += ` AND g.name ILIKE $${paramCount}`;
            values.push(`%${search}%`);
        }
        if (pass_type) {
            paramCount++;
            query += ` AND qp.pass_type = $${paramCount}`;
            values.push(pass_type);
        }
        if (status) {
            paramCount++;
            query += ` AND qp.status = $${paramCount}`;
            values.push(status);
        }

        paramCount++;
        query += ` ORDER BY qp.created_at DESC LIMIT $${paramCount}`;
        values.push(limit);

        paramCount++;
        query += ` OFFSET $${paramCount}`;
        values.push(offset);

        const result = await pool.query(query, values);
        return result.rows.map(row => QrPass.fromRow(row));
    }

    async getPassesCount(eventId, companyId, { search, pass_type, status }) {
        let query = `
            SELECT COUNT(qp.pass_id)::INTEGER
            FROM qr_passes qp
            JOIN guest g ON qp.guest_id = g.guest_id
            JOIN event_guest eg ON g.guest_id = eg.guest_id
            WHERE eg.event_id = $1 AND qp.company_id = $2
        `;
        const values = [eventId, companyId];
        let paramCount = 2;

        if (search) {
            paramCount++;
            query += ` AND g.name ILIKE $${paramCount}`;
            values.push(`%${search}%`);
        }
        if (pass_type) {
            paramCount++;
            query += ` AND qp.pass_type = $${paramCount}`;
            values.push(pass_type);
        }
        if (status) {
            paramCount++;
            query += ` AND qp.status = $${paramCount}`;
            values.push(status);
        }

        const result = await pool.query(query, values);
        return result.rows[0].count;
    }

    // ==========================================
    // 2. Deliveries
    // ==========================================
    async createDeliveryLog(data) {
        const query = `
            INSERT INTO qr_pass_deliveries (company_id, pass_id, channel, recipient_address, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const result = await pool.query(query, [data.company_id, data.pass_id, data.channel, data.recipient_address, data.status || 'Pending']);
        return QrPassDelivery.fromRow(result.rows[0]);
    }

    async updateDeliveryStatus(deliveryId, status, errorMsg, companyId) {
        const query = `
            UPDATE qr_pass_deliveries 
            SET status = $1, error_message = $2, sent_at = CASE WHEN $1 = 'Sent' THEN CURRENT_TIMESTAMP ELSE sent_at END,
                delivered_at = CASE WHEN $1 = 'Delivered' THEN CURRENT_TIMESTAMP ELSE delivered_at END
            WHERE delivery_id = $3 AND company_id = $4
            RETURNING *;
        `;
        const result = await pool.query(query, [status, errorMsg, deliveryId, companyId]);
        return QrPassDelivery.fromRow(result.rows[0]);
    }

    // ==========================================
    // 3. Scanner Devices
    // ==========================================
    async getScannerByToken(accessToken) {
        const query = `SELECT * FROM scanner_devices WHERE access_token = $1 AND status = 'Active';`;
        const result = await pool.query(query, [accessToken]);
        return ScannerDevice.fromRow(result.rows[0]);
    }

    async registerScanner(data) {
        const query = `
            INSERT INTO scanner_devices (company_id, device_name, device_type, access_token, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const result = await pool.query(query, [data.company_id, data.device_name, data.device_type || 'Handheld', data.access_token, data.status || 'Active']);
        return ScannerDevice.fromRow(result.rows[0]);
    }

    async updateScannerActivity(deviceId) {
        const query = `UPDATE scanner_devices SET last_active = CURRENT_TIMESTAMP WHERE device_id = $1;`;
        await pool.query(query, [deviceId]);
    }

    // ==========================================
    // 4. Pass Scan Logs
    // ==========================================
    async logPassScan(data) {
        const query = `
            INSERT INTO pass_scan_logs (company_id, pass_id, device_id, scan_location, scanned_by, scan_status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const result = await pool.query(query, [data.company_id, data.pass_id, data.device_id || null, data.scan_location, data.scanned_by || null, data.scan_status]);
        return PassScanLog.fromRow(result.rows[0]);
    }

    async getRecentScanLogs(companyId, limit = 5) {
        const query = `
            SELECT psl.*, qp.pass_code, g.name as guest_name, sd.device_name
            FROM pass_scan_logs psl
            JOIN qr_passes qp ON psl.pass_id = qp.pass_id
            JOIN guest g ON qp.guest_id = g.guest_id
            LEFT JOIN scanner_devices sd ON psl.device_id = sd.device_id
            WHERE psl.company_id = $1
            ORDER BY psl.scanned_at DESC
            LIMIT $2;
        `;
        const result = await pool.query(query, [companyId, limit]);
        return result.rows.map(row => PassScanLog.fromRow(row));
    }

    async getScanLogsList(eventId, companyId, { limit = 100, start_date, end_date }) {
        let query = `
            SELECT psl.*, qp.pass_code, g.name as guest_name, sd.device_name
            FROM pass_scan_logs psl
            JOIN qr_passes qp ON psl.pass_id = qp.pass_id
            JOIN guest g ON qp.guest_id = g.guest_id
            JOIN event_guest eg ON g.guest_id = eg.guest_id
            LEFT JOIN scanner_devices sd ON psl.device_id = sd.device_id
            WHERE eg.event_id = $1 AND psl.company_id = $2
        `;
        const values = [eventId, companyId];
        let paramCount = 2;

        if (start_date) {
            paramCount++;
            query += ` AND psl.scanned_at >= $${paramCount}`;
            values.push(start_date);
        }
        if (end_date) {
            paramCount++;
            query += ` AND psl.scanned_at <= $${paramCount}`;
            values.push(end_date);
        }

        paramCount++;
        query += ` ORDER BY psl.scanned_at DESC LIMIT $${paramCount}`;
        values.push(limit);

        const result = await pool.query(query, values);
        return result.rows.map(row => PassScanLog.fromRow(row));
    }

    // ==========================================
    // 5. Pass Security Audits
    // ==========================================
    async logSecurityAudit(data) {
        const query = `
            INSERT INTO pass_security_audits (company_id, pass_id, action_type, ip_address, user_agent, hash_verified, details)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [
            data.company_id,
            data.pass_id,
            data.action_type,
            data.ip_address,
            data.user_agent || null,
            data.hash_verified !== undefined ? data.hash_verified : true,
            data.details || '{}'
        ];
        const result = await pool.query(query, values);
        return PassSecurityAudit.fromRow(result.rows[0]);
    }

    // ==========================================
    // 6. Batch jobs
    // ==========================================
    async createBatchJob(data) {
        const query = `
            INSERT INTO batch_pass_generations (company_id, event_id, pass_type, total_passes, generated_count, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const result = await pool.query(query, [data.company_id, data.event_id, data.pass_type, data.total_passes, 0, 'Processing']);
        return BatchPassGeneration.fromRow(result.rows[0]);
    }

    async updateBatchProgress(batchId, count, status, errorMsg, companyId) {
        const query = `
            UPDATE batch_pass_generations 
            SET generated_count = $1, status = $2, error_log = $3, completed_at = CASE WHEN $2 IN ('Completed', 'Failed') THEN CURRENT_TIMESTAMP ELSE completed_at END
            WHERE batch_id = $4 AND company_id = $5
            RETURNING *;
        `;
        const result = await pool.query(query, [count, status, errorMsg, batchId, companyId]);
        return BatchPassGeneration.fromRow(result.rows[0]);
    }

    async getBatchById(batchId, companyId) {
        const query = `SELECT * FROM batch_pass_generations WHERE batch_id = $1 AND company_id = $2;`;
        const result = await pool.query(query, [batchId, companyId]);
        return BatchPassGeneration.fromRow(result.rows[0]);
    }

    // ==========================================
    // 7. Revocation
    // ==========================================
    async logRevocation(data) {
        const query = `
            INSERT INTO pass_revocation_logs (company_id, pass_id, revoked_by, revocation_reason)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await pool.query(query, [data.company_id, data.pass_id, data.revoked_by, data.revocation_reason]);
        return PassRevocationLog.fromRow(result.rows[0]);
    }

    // ==========================================
    // 8. Stats queries
    // ==========================================
    async getQrPassStats(eventId, companyId) {
        // Total generated passes count
        const totalQuery = `
            SELECT COUNT(qp.pass_id)::INTEGER 
            FROM qr_passes qp
            JOIN guest g ON qp.guest_id = g.guest_id
            JOIN event_guest eg ON g.guest_id = eg.guest_id
            WHERE eg.event_id = $1 AND qp.company_id = $2;
        `;
        const totalRes = await pool.query(totalQuery, [eventId, companyId]);

        // Scanned / active check-in count
        const scannedQuery = `
            SELECT COUNT(qp.pass_id)::INTEGER 
            FROM qr_passes qp
            JOIN guest g ON qp.guest_id = g.guest_id
            JOIN event_guest eg ON g.guest_id = eg.guest_id
            WHERE eg.event_id = $1 AND qp.company_id = $2 AND qp.status = 'Scanned';
        `;
        const scannedRes = await pool.query(scannedQuery, [eventId, companyId]);

        // Pending deliveries count
        const pendingQuery = `
            SELECT COUNT(qpd.delivery_id)::INTEGER 
            FROM qr_pass_deliveries qpd
            WHERE qpd.status = 'Pending' AND qpd.company_id = $1;
        `;
        const pendingRes = await pool.query(pendingQuery, [companyId]);

        // Security logs count
        const auditsQuery = `
            SELECT COUNT(*)::INTEGER as total_audits,
                   COALESCE(COUNT(CASE WHEN hash_verified = FALSE OR action_type = 'Tamper Detected' THEN 1 END), 0)::INTEGER as failed_audits
            FROM pass_security_audits
            WHERE company_id = $1;
        `;
        const auditsRes = await pool.query(auditsQuery, [companyId]);

        return {
            totalPasses: totalRes.rows[0].count,
            scannedActiveCount: scannedRes.rows[0].count,
            pendingDeliveryCount: pendingRes.rows[0].count,
            totalAuditsCount: auditsRes.rows[0].total_audits,
            failedAuditsCount: auditsRes.rows[0].failed_audits
        };
    }
}

module.exports = new QrPassRepository();
