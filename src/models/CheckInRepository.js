const pool = require('../config/db');
const CheckInRecord = require('./CheckInRecord');
const AttendanceTracker = require('./AttendanceTracker');
const EntryGate = require('./EntryGate');
const VipArrivalAlert = require('./VipArrivalAlert');
const CheckInStaff = require('./CheckInStaff');
const CheckInHistory = require('./CheckInHistory');
const FlowAnalytics = require('./FlowAnalytics');
const GuestFlag = require('./GuestFlag');

class CheckInRepository {
    // ==========================================
    // 1. Check-In Records
    // ==========================================
    async getCheckInRecordById(recordId) {
        const query = `
            SELECT cr.*, g.name as guest_name, g.category as guest_category, eg.gate_name, qp.pass_code
            FROM checkin_records cr
            JOIN guest g ON cr.guest_id = g.guest_id
            LEFT JOIN entry_gates eg ON cr.entry_gate_id = eg.entry_gate_id
            LEFT JOIN qr_passes qp ON cr.pass_id = qp.pass_id
            WHERE cr.checkin_record_id = $1;
        `;
        const result = await pool.query(query, [recordId]);
        return CheckInRecord.fromRow(result.rows[0]);
    }

    async getCheckInRecordByGuest(eventId, guestId) {
        const query = `SELECT * FROM checkin_records WHERE event_id = $1 AND guest_id = $2;`;
        const result = await pool.query(query, [eventId, guestId]);
        return CheckInRecord.fromRow(result.rows[0]);
    }

    async createCheckInRecord(data) {
        const query = `
            INSERT INTO checkin_records (guest_id, event_id, pass_id, scanner_device_id, entry_gate_id, checkin_method, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [
            data.guest_id,
            data.event_id,
            data.pass_id || null,
            data.scanner_device_id || null,
            data.entry_gate_id || null,
            data.checkin_method,
            data.status || 'Success'
        ];
        const result = await pool.query(query, values);
        return CheckInRecord.fromRow(result.rows[0]);
    }

    async getRecentCheckInRecords(eventId, limit = 5) {
        const query = `
            SELECT cr.*, g.name as guest_name, g.category as guest_category, eg.gate_name, qp.pass_code
            FROM checkin_records cr
            JOIN guest g ON cr.guest_id = g.guest_id
            LEFT JOIN entry_gates eg ON cr.entry_gate_id = eg.entry_gate_id
            LEFT JOIN qr_passes qp ON cr.pass_id = qp.pass_id
            WHERE cr.event_id = $1
            ORDER BY cr.checkin_time DESC
            LIMIT $2;
        `;
        const result = await pool.query(query, [eventId, limit]);
        return result.rows.map(row => CheckInRecord.fromRow(row));
    }

    async getCheckInRecordsList(eventId, { page = 1, limit = 10, search, gate_id, status }) {
        const offset = (page - 1) * limit;
        let query = `
            SELECT cr.*, g.name as guest_name, g.category as guest_category, eg.gate_name, qp.pass_code
            FROM checkin_records cr
            JOIN guest g ON cr.guest_id = g.guest_id
            LEFT JOIN entry_gates eg ON cr.entry_gate_id = eg.entry_gate_id
            LEFT JOIN qr_passes qp ON cr.pass_id = qp.pass_id
            WHERE cr.event_id = $1
        `;
        const values = [eventId];
        let paramCount = 1;

        if (search) {
            paramCount++;
            query += ` AND g.name ILIKE $${paramCount}`;
            values.push(`%${search}%`);
        }
        if (gate_id) {
            paramCount++;
            query += ` AND cr.entry_gate_id = $${paramCount}`;
            values.push(gate_id);
        }
        if (status) {
            paramCount++;
            query += ` AND cr.status = $${paramCount}`;
            values.push(status);
        }

        paramCount++;
        query += ` ORDER BY cr.checkin_time DESC LIMIT $${paramCount}`;
        values.push(limit);

        paramCount++;
        query += ` OFFSET $${paramCount}`;
        values.push(offset);

        const result = await pool.query(query, values);
        return result.rows.map(row => CheckInRecord.fromRow(row));
    }

    async getCheckInRecordsCount(eventId, { search, gate_id, status }) {
        let query = `
            SELECT COUNT(cr.checkin_record_id)::INTEGER
            FROM checkin_records cr
            JOIN guest g ON cr.guest_id = g.guest_id
            WHERE cr.event_id = $1
        `;
        const values = [eventId];
        let paramCount = 1;

        if (search) {
            paramCount++;
            query += ` AND g.name ILIKE $${paramCount}`;
            values.push(`%${search}%`);
        }
        if (gate_id) {
            paramCount++;
            query += ` AND cr.entry_gate_id = $${paramCount}`;
            values.push(gate_id);
        }
        if (status) {
            paramCount++;
            query += ` AND cr.status = $${paramCount}`;
            values.push(status);
        }

        const result = await pool.query(query, values);
        return result.rows[0].count;
    }

    // ==========================================
    // 2. Attendance Tracker
    // ==========================================
    async getAttendanceTracker(eventId) {
        const query = `SELECT * FROM attendance_trackers WHERE event_id = $1;`;
        const result = await pool.query(query, [eventId]);
        return AttendanceTracker.fromRow(result.rows[0]);
    }

    async createAttendanceTracker(data) {
        const query = `
            INSERT INTO attendance_trackers (event_id, expected_guests, checked_in_guests, vip_checked_in, occupancy_percentage)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (event_id) DO UPDATE 
            SET expected_guests = EXCLUDED.expected_guests, checked_in_guests = EXCLUDED.checked_in_guests,
                vip_checked_in = EXCLUDED.vip_checked_in, occupancy_percentage = EXCLUDED.occupancy_percentage, updated_at = CURRENT_TIMESTAMP
            RETURNING *;
        `;
        const result = await pool.query(query, [data.event_id, data.expected_guests, data.checked_in_guests || 0, data.vip_checked_in || 0, data.occupancy_percentage || 0.00]);
        return AttendanceTracker.fromRow(result.rows[0]);
    }

    async incrementAttendance(eventId, isVip = false) {
        const query = `
            UPDATE attendance_trackers 
            SET checked_in_guests = checked_in_guests + 1,
                vip_checked_in = CASE WHEN $1 = TRUE THEN vip_checked_in + 1 ELSE vip_checked_in END,
                occupancy_percentage = CASE WHEN expected_guests > 0 THEN ((checked_in_guests + 1.0) / expected_guests) * 100.00 ELSE 0.00 END,
                updated_at = CURRENT_TIMESTAMP
            WHERE event_id = $2
            RETURNING *;
        `;
        const result = await pool.query(query, [isVip, eventId]);
        return AttendanceTracker.fromRow(result.rows[0]);
    }

    // ==========================================
    // 3. Entry Gates
    // ==========================================
    async getGatesByEvent(eventId) {
        const query = `SELECT * FROM entry_gates WHERE event_id = $1 ORDER BY gate_name ASC;`;
        const result = await pool.query(query, [eventId]);
        return result.rows.map(row => EntryGate.fromRow(row));
    }

    async getGateById(gateId) {
        const query = `SELECT * FROM entry_gates WHERE entry_gate_id = $1;`;
        const result = await pool.query(query, [gateId]);
        return EntryGate.fromRow(result.rows[0]);
    }

    async createGate(data) {
        const query = `
            INSERT INTO entry_gates (event_id, gate_name, gate_type, capacity_limit, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const result = await pool.query(query, [data.event_id, data.gate_name, data.gate_type, data.capacity_limit || 500, data.status || 'Clear Flow']);
        return EntryGate.fromRow(result.rows[0]);
    }

    async updateGate(gateId, data) {
        const query = `
            UPDATE entry_gates 
            SET gate_name = COALESCE($1, gate_name),
                gate_type = COALESCE($2, gate_type),
                capacity_limit = COALESCE($3, capacity_limit),
                status = COALESCE($4, status)
            WHERE entry_gate_id = $5
            RETURNING *;
        `;
        const result = await pool.query(query, [data.gate_name, data.gate_type, data.capacity_limit, data.status, gateId]);
        return EntryGate.fromRow(result.rows[0]);
    }

    // ==========================================
    // 4. VIP Arrival Alerts
    // ==========================================
    async createVipArrivalAlert(data) {
        const query = `
            INSERT INTO vip_arrival_alerts (guest_id, event_id, alert_status)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const result = await pool.query(query, [data.guest_id, data.event_id, data.alert_status || 'Unread']);
        return VipArrivalAlert.fromRow(result.rows[0]);
    }

    async getUnreadVipAlerts(eventId, limit = 5) {
        const query = `
            SELECT vaa.*, g.name as guest_name, g.category as guest_category, eg.gate_name,
                   (SELECT table_number FROM event_tables et JOIN table_assignments ta ON et.table_id = ta.table_id WHERE ta.guest_id = vaa.guest_id LIMIT 1) as table_number
            FROM vip_arrival_alerts vaa
            JOIN guest g ON vaa.guest_id = g.guest_id
            LEFT JOIN checkin_records cr ON vaa.guest_id = cr.guest_id AND vaa.event_id = cr.event_id
            LEFT JOIN entry_gates eg ON cr.entry_gate_id = eg.entry_gate_id
            WHERE vaa.event_id = $1 AND vaa.alert_status = 'Unread'
            ORDER BY vaa.arrival_time DESC
            LIMIT $2;
        `;
        const result = await pool.query(query, [eventId, limit]);
        return result.rows.map(row => VipArrivalAlert.fromRow(row));
    }

    async markVipAlertRead(alertId) {
        const query = `UPDATE vip_arrival_alerts SET alert_status = 'Read' WHERE alert_id = $1 RETURNING *;`;
        const result = await pool.query(query, [alertId]);
        return VipArrivalAlert.fromRow(result.rows[0]);
    }

    // ==========================================
    // 5. Staff Shift
    // ==========================================
    async createStaffShift(data) {
        const query = `
            INSERT INTO checkin_staff (user_id, event_id, entry_gate_id, shift_start, shift_end)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const result = await pool.query(query, [data.user_id, data.event_id, data.entry_gate_id, data.shift_start, data.shift_end]);
        return CheckInStaff.fromRow(result.rows[0]);
    }

    async getStaffShiftsByEvent(eventId) {
        const query = `
            SELECT cs.*, u.name as staff_name, eg.gate_name 
            FROM checkin_staff cs
            JOIN users u ON cs.user_id = u.user_id
            LEFT JOIN entry_gates eg ON cs.entry_gate_id = eg.entry_gate_id
            WHERE cs.event_id = $1
            ORDER BY cs.shift_start ASC;
        `;
        const result = await pool.query(query, [eventId]);
        return result.rows.map(row => CheckInStaff.fromRow(row));
    }

    // ==========================================
    // 6. Histories
    // ==========================================
    async logCheckInHistory(data) {
        const query = `
            INSERT INTO checkin_histories (guest_id, event_id, action, performed_by)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await pool.query(query, [data.guest_id, data.event_id, data.action, data.performed_by]);
        return CheckInHistory.fromRow(result.rows[0]);
    }

    // ==========================================
    // 7. Flow Analytics
    // ==========================================
    async logFlowAnalytics(data) {
        const query = `
            INSERT INTO flow_analytics (event_id, time_slot, guest_count, flow_rate, peak_indicator)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (event_id, time_slot) DO UPDATE 
            SET guest_count = EXCLUDED.guest_count, flow_rate = EXCLUDED.flow_rate, peak_indicator = EXCLUDED.peak_indicator
            RETURNING *;
        `;
        const result = await pool.query(query, [data.event_id, data.time_slot, data.guest_count, data.flow_rate, data.peak_indicator]);
        return FlowAnalytics.fromRow(result.rows[0]);
    }

    async getFlowAnalyticsByEvent(eventId, limit = 10) {
        const query = `
            SELECT * FROM flow_analytics 
            WHERE event_id = $1 
            ORDER BY time_slot DESC 
            LIMIT $2;
        `;
        const result = await pool.query(query, [eventId, limit]);
        return result.rows.map(row => FlowAnalytics.fromRow(row));
    }

    // ==========================================
    // 8. Guest Flags
    // ==========================================
    async createGuestFlag(data) {
        const query = `
            INSERT INTO guest_flags (guest_id, event_id, flag_reason, flag_status)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (event_id, guest_id) DO UPDATE 
            SET flag_reason = EXCLUDED.flag_reason, flag_status = EXCLUDED.flag_status
            RETURNING *;
        `;
        const result = await pool.query(query, [data.guest_id, data.event_id, data.flag_reason, data.flag_status || 'Flagged']);
        return GuestFlag.fromRow(result.rows[0]);
    }

    async updateGuestFlagStatus(flagId, status, reviewedBy) {
        const query = `
            UPDATE guest_flags 
            SET flag_status = $1, reviewed_by = $2
            WHERE flag_id = $3
            RETURNING *;
        `;
        const result = await pool.query(query, [status, reviewedBy, flagId]);
        return GuestFlag.fromRow(result.rows[0]);
    }

    async getGuestFlag(eventId, guestId) {
        const query = `SELECT * FROM guest_flags WHERE event_id = $1 AND guest_id = $2;`;
        const result = await pool.query(query, [eventId, guestId]);
        return GuestFlag.fromRow(result.rows[0]);
    }
}

module.exports = new CheckInRepository();
