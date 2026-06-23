const pool = require('../config/db');
const KioskDevice = require('./KioskDevice');
const KioskSession = require('./KioskSession');
const BusinessCardScan = require('./BusinessCardScan');
const GuestPhoto = require('./GuestPhoto');
const RegistrationAuditLog = require('./RegistrationAuditLog');
const KioskLanguage = require('./KioskLanguage');
const RegistrationQueue = require('./RegistrationQueue');

class KioskRegistrationRepository {
    // ==========================================
    // 1. Kiosk Devices
    // ==========================================
    async createDevice(data, client = pool) {
        const query = `
            INSERT INTO kiosk_devices (company_id, branch_id, device_name, device_code, location, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.branch_id || null,
            data.device_name,
            data.device_code,
            data.location || null,
            data.status || 'Active'
        ]);
        return KioskDevice.fromRow(result.rows[0]);
    }

    async findDeviceById(id, companyId) {
        const query = `SELECT * FROM kiosk_devices WHERE id = $1 AND company_id = $2;`;
        const result = await pool.query(query, [id, companyId]);
        return KioskDevice.fromRow(result.rows[0]);
    }

    async findDeviceByCode(code, companyId) {
        const query = `SELECT * FROM kiosk_devices WHERE device_code = $1 AND company_id = $2;`;
        const result = await pool.query(query, [code, companyId]);
        return KioskDevice.fromRow(result.rows[0]);
    }

    async findAllDevices(companyId) {
        const query = `SELECT * FROM kiosk_devices WHERE company_id = $1 ORDER BY device_name ASC;`;
        const result = await pool.query(query, [companyId]);
        return result.rows.map(row => KioskDevice.fromRow(row));
    }

    async updateDevice(id, companyId, data, client = pool) {
        const setFields = [];
        const values = [id, companyId];
        let paramCount = 2;

        const fields = ['device_name', 'location', 'status'];
        for (const field of fields) {
            if (data[field] !== undefined) {
                paramCount++;
                setFields.push(`${field} = $${paramCount}`);
                values.push(data[field]);
            }
        }

        if (setFields.length === 0) {
            return this.findDeviceById(id, companyId);
        }

        setFields.push(`updated_at = NOW()`);
        const query = `
            UPDATE kiosk_devices
            SET ${setFields.join(', ')}
            WHERE id = $1 AND company_id = $2
            RETURNING *;
        `;
        const result = await client.query(query, values);
        return KioskDevice.fromRow(result.rows[0]);
    }

    async updateDeviceLastSeen(id, companyId, client = pool) {
        const query = `
            UPDATE kiosk_devices
            SET last_seen = NOW()
            WHERE id = $1 AND company_id = $2;
        `;
        await client.query(query, [id, companyId]);
    }

    async getKioskHealthSummary(companyId) {
        const query = `
            SELECT 
                COALESCE(COUNT(CASE WHEN status = 'Active' AND last_seen >= NOW() - INTERVAL '5 minutes' THEN 1 END), 0)::INTEGER as online,
                COALESCE(COUNT(CASE WHEN status = 'Offline' OR last_seen < NOW() - INTERVAL '5 minutes' THEN 1 END), 0)::INTEGER as offline,
                COALESCE(COUNT(CASE WHEN status = 'Assistance Required' THEN 1 END), 0)::INTEGER as assistance
            FROM kiosk_devices
            WHERE company_id = $1;
        `;
        const result = await pool.query(query, [companyId]);
        return result.rows[0];
    }

    // ==========================================
    // 2. Kiosk Sessions
    // ==========================================
    async createSession(data, client = pool) {
        const query = `
            INSERT INTO kiosk_sessions (company_id, kiosk_device_id, guest_id, session_start, status)
            VALUES ($1, $2, $3, NOW(), 'Active')
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.kiosk_device_id,
            data.guest_id || null
        ]);
        return KioskSession.fromRow(result.rows[0]);
    }

    async findSessionById(id, companyId) {
        const query = `
            SELECT s.*, d.device_name, g.name as guest_name
            FROM kiosk_sessions s
            JOIN kiosk_devices d ON s.kiosk_device_id = d.id
            LEFT JOIN guest g ON s.guest_id = g.guest_id
            WHERE s.id = $1 AND s.company_id = $2;
        `;
        const result = await pool.query(query, [id, companyId]);
        return KioskSession.fromRow(result.rows[0]);
    }

    async updateSessionStatus(id, companyId, status, guestId = null, client = pool) {
        const query = `
            UPDATE kiosk_sessions
            SET status = $1, guest_id = COALESCE($2, guest_id), session_end = NOW()
            WHERE id = $3 AND company_id = $4
            RETURNING *;
        `;
        const result = await client.query(query, [status, guestId, id, companyId]);
        return KioskSession.fromRow(result.rows[0]);
    }

    async getActiveSessionsCount(companyId) {
        const query = `SELECT COUNT(*)::INTEGER FROM kiosk_sessions WHERE company_id = $1 AND status = 'Active';`;
        const result = await pool.query(query, [companyId]);
        return result.rows[0].count;
    }

    // ==========================================
    // 3. Business Card Scans
    // ==========================================
    async createCardScan(data, client = pool) {
        const query = `
            INSERT INTO business_card_scans (company_id, guest_id, image_url, ocr_data, processing_status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.guest_id || null,
            data.image_url,
            JSON.stringify(data.ocr_data || {}),
            data.processing_status || 'Pending'
        ]);
        return BusinessCardScan.fromRow(result.rows[0]);
    }

    async findCardScanById(id, companyId) {
        const query = `SELECT * FROM business_card_scans WHERE id = $1 AND company_id = $2;`;
        const result = await pool.query(query, [id, companyId]);
        return BusinessCardScan.fromRow(result.rows[0]);
    }

    async updateCardScanStatus(id, companyId, ocrData, status, guestId = null, client = pool) {
        const query = `
            UPDATE business_card_scans
            SET ocr_data = $1, processing_status = $2, guest_id = COALESCE($3, guest_id)
            WHERE id = $4 AND company_id = $5
            RETURNING *;
        `;
        const result = await client.query(query, [
            JSON.stringify(ocrData),
            status,
            guestId,
            id,
            companyId
        ]);
        return BusinessCardScan.fromRow(result.rows[0]);
    }

    // ==========================================
    // 4. Guest Photos
    // ==========================================
    async createPhoto(data, client = pool) {
        const query = `
            INSERT INTO guest_photos (company_id, guest_id, photo_url, capture_source)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.guest_id,
            data.photo_url,
            data.capture_source || 'Kiosk Camera'
        ]);
        return GuestPhoto.fromRow(result.rows[0]);
    }

    async findPhotoByGuestId(guestId, companyId) {
        const query = `SELECT * FROM guest_photos WHERE guest_id = $1 AND company_id = $2;`;
        const result = await pool.query(query, [guestId, companyId]);
        return GuestPhoto.fromRow(result.rows[0]);
    }

    // ==========================================
    // 5. Audit Logs
    // ==========================================
    async createAuditLog(data, client = pool) {
        const query = `
            INSERT INTO registration_audit_logs (company_id, guest_id, action, performed_by)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.guest_id || null,
            data.action,
            data.performed_by || 'Kiosk'
        ]);
        return RegistrationAuditLog.fromRow(result.rows[0]);
    }

    async getAuditLogs(companyId, { limit = 10, offset = 0 } = {}) {
        const query = `
            SELECT l.*, g.name as guest_name
            FROM registration_audit_logs l
            LEFT JOIN guest g ON l.guest_id = g.guest_id
            WHERE l.company_id = $1
            ORDER BY l.created_at DESC
            LIMIT $2 OFFSET $3;
        `;
        const result = await pool.query(query, [companyId, limit, offset]);
        return result.rows.map(row => RegistrationAuditLog.fromRow(row));
    }

    async countAuditLogs(companyId) {
        const query = `SELECT COUNT(*)::INTEGER FROM registration_audit_logs WHERE company_id = $1;`;
        const result = await pool.query(query, [companyId]);
        return result.rows[0].count;
    }

    // ==========================================
    // 6. Kiosk Languages
    // ==========================================
    async createLanguage(data, client = pool) {
        const query = `
            INSERT INTO kiosk_languages (language_code, language_name, is_active)
            VALUES ($1, $2, $3)
            ON CONFLICT (language_code) DO UPDATE 
            SET language_name = EXCLUDED.language_name, is_active = EXCLUDED.is_active
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.language_code,
            data.language_name,
            data.is_active !== undefined ? data.is_active : true
        ]);
        return KioskLanguage.fromRow(result.rows[0]);
    }

    async getLanguages({ activeOnly = true } = {}) {
        let query = `SELECT * FROM kiosk_languages`;
        if (activeOnly) {
            query += ` WHERE is_active = TRUE`;
        }
        query += ` ORDER BY language_name ASC;`;
        const result = await pool.query(query);
        return result.rows.map(row => KioskLanguage.fromRow(row));
    }

    // ==========================================
    // 7. Registration Queue
    // ==========================================
    async enqueueRegistration(data, client = pool) {
        const query = `
            INSERT INTO registration_queues (company_id, guest_id, queue_status, priority)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.guest_id,
            data.queue_status || 'Pending',
            data.priority || 1
        ]);
        return RegistrationQueue.fromRow(result.rows[0]);
    }

    async getQueueItems(companyId) {
        const query = `
            SELECT q.*, g.name as guest_name, g.email as guest_email, g.company as guest_company, g.category as guest_category
            FROM registration_queues q
            JOIN guest g ON q.guest_id = g.guest_id
            WHERE q.company_id = $1
            ORDER BY q.priority DESC, q.created_at ASC;
        `;
        const result = await pool.query(query, [companyId]);
        return result.rows.map(row => RegistrationQueue.fromRow(row));
    }

    async updateQueueItem(id, companyId, data, client = pool) {
        const setFields = [];
        const values = [id, companyId];
        let paramCount = 2;

        const fields = ['queue_status', 'priority'];
        for (const field of fields) {
            if (data[field] !== undefined) {
                paramCount++;
                setFields.push(`${field} = $${paramCount}`);
                values.push(data[field]);
            }
        }

        if (setFields.length === 0) {
            const getQ = await pool.query(`SELECT * FROM registration_queues WHERE id = $1 AND company_id = $2;`, [id, companyId]);
            return RegistrationQueue.fromRow(getQ.rows[0]);
        }

        const query = `
            UPDATE registration_queues
            SET ${setFields.join(', ')}
            WHERE id = $1 AND company_id = $2
            RETURNING *;
        `;
        const result = await client.query(query, values);
        return RegistrationQueue.fromRow(result.rows[0]);
    }

    async removeFromQueue(id, companyId, client = pool) {
        const query = `DELETE FROM registration_queues WHERE id = $1 AND company_id = $2;`;
        const result = await client.query(query, [id, companyId]);
        return result.rowCount > 0;
    }

    // ==========================================
    // 8. Reusable Core Guest Operations
    // ==========================================
    async findGuestByEmail(email, companyId) {
        const query = `SELECT * FROM guest WHERE email = $1 AND company_id = $2;`;
        const result = await pool.query(query, [email, companyId]);
        return result.rows[0];
    }

    async createGuest(data, client = pool) {
        const query = `
            INSERT INTO guest (company_id, name, email, phone, category, company, job_title)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.name,
            data.email,
            data.phone || null,
            data.category || 'Attendee',
            data.company || null,
            data.job_title || null
        ]);
        return result.rows[0];
    }

    async linkGuestToEvent(guestId, eventId, client = pool) {
        const query = `
            INSERT INTO event_guest (event_id, guest_id, invited)
            VALUES ($1, $2, TRUE)
            ON CONFLICT DO NOTHING;
        `;
        await client.query(query, [eventId, guestId]);
    }
}

module.exports = new KioskRegistrationRepository();
