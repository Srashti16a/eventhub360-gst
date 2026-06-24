const pool = require('../config/db');
const GuestReport = require('./GuestReport');
const ReportTemplate = require('./ReportTemplate');
const ReportColumn = require('./ReportColumn');
const GuestDataSnapshot = require('./GuestDataSnapshot');
const ReportExportHistory = require('./ReportExportHistory');
const GuestCategoryAnalytics = require('./GuestCategoryAnalytics');
const AttendanceTrend = require('./AttendanceTrend');
const SatisfactionAnalytics = require('./SatisfactionAnalytics');

class GuestReportingRepository {
    // ==========================================
    // 1. Saved Templates & Columns
    // ==========================================
    async createTemplate(data, client = pool) {
        const query = `
            INSERT INTO report_templates (company_id, name, description, group_by_column, filter_criteria, sort_criteria)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.name,
            data.description || null,
            data.group_by_column || null,
            JSON.stringify(data.filter_criteria || {}),
            JSON.stringify(data.sort_criteria || {})
        ]);
        return ReportTemplate.fromRow(result.rows[0]);
    }

    async findTemplateById(id, companyId) {
        const query = `SELECT * FROM report_templates WHERE id = $1 AND company_id = $2;`;
        const result = await pool.query(query, [id, companyId]);
        return ReportTemplate.fromRow(result.rows[0]);
    }

    async findAllTemplates(companyId) {
        const query = `SELECT * FROM report_templates WHERE company_id = $1 ORDER BY name ASC;`;
        const result = await pool.query(query, [companyId]);
        return result.rows.map(row => ReportTemplate.fromRow(row));
    }

    async deleteTemplate(id, companyId, client = pool) {
        const query = `DELETE FROM report_templates WHERE id = $1 AND company_id = $2;`;
        const result = await client.query(query, [id, companyId]);
        return result.rowCount > 0;
    }

    async createReportColumn(data, client = pool) {
        const query = `
            INSERT INTO report_columns (template_id, column_name, display_label, column_order)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.template_id,
            data.column_name,
            data.display_label,
            data.column_order || 0
        ]);
        return ReportColumn.fromRow(result.rows[0]);
    }

    async getReportColumnsByTemplate(templateId) {
        const query = `SELECT * FROM report_columns WHERE template_id = $1 ORDER BY column_order ASC, column_name ASC;`;
        const result = await pool.query(query, [templateId]);
        return result.rows.map(row => ReportColumn.fromRow(row));
    }

    // ==========================================
    // 2. Guest Reports
    // ==========================================
    async createReport(data, client = pool) {
        const query = `
            INSERT INTO guest_reports (company_id, event_id, name, description, template_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.event_id,
            data.name,
            data.description || null,
            data.template_id || null
        ]);
        return GuestReport.fromRow(result.rows[0]);
    }

    async findReportById(id, companyId) {
        const query = `SELECT * FROM guest_reports WHERE id = $1 AND company_id = $2;`;
        const result = await pool.query(query, [id, companyId]);
        return GuestReport.fromRow(result.rows[0]);
    }

    async findAllReports(companyId, eventId) {
        const query = `
            SELECT * FROM guest_reports
            WHERE company_id = $1 AND event_id = $2
            ORDER BY created_at DESC;
        `;
        const result = await pool.query(query, [companyId, eventId]);
        return result.rows.map(row => GuestReport.fromRow(row));
    }

    async deleteReport(id, companyId, client = pool) {
        const query = `DELETE FROM guest_reports WHERE id = $1 AND company_id = $2;`;
        const result = await client.query(query, [id, companyId]);
        return result.rowCount > 0;
    }

    // ==========================================
    // 3. Guest Data Snapshots
    // ==========================================
    async createGuestSnapshot(data, client = pool) {
        const query = `
            INSERT INTO guest_data_snapshots (report_id, guest_id, snapshot_data)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.report_id,
            data.guest_id,
            JSON.stringify(data.snapshot_data || {})
        ]);
        return GuestDataSnapshot.fromRow(result.rows[0]);
    }

    async getSnapshotsByReport(reportId) {
        const query = `SELECT * FROM guest_data_snapshots WHERE report_id = $1 ORDER BY id ASC;`;
        const result = await pool.query(query, [reportId]);
        return result.rows.map(row => GuestDataSnapshot.fromRow(row));
    }

    // ==========================================
    // 4. Export History
    // ==========================================
    async createExportHistory(data, client = pool) {
        const query = `
            INSERT INTO report_export_histories (company_id, report_id, export_type, file_url, performed_by)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.report_id || null,
            data.export_type,
            data.file_url,
            data.performed_by || null
        ]);
        return ReportExportHistory.fromRow(result.rows[0]);
    }

    async getExportHistories(companyId) {
        const query = `SELECT * FROM report_export_histories WHERE company_id = $1 ORDER BY created_at DESC;`;
        const result = await pool.query(query, [companyId]);
        return result.rows.map(row => ReportExportHistory.fromRow(row));
    }

    // ==========================================
    // 5. Performance Cache Analytics
    // ==========================================
    async createOrUpdateCategoryAnalytics(data, client = pool) {
        const query = `
            INSERT INTO guest_category_analytics (company_id, event_id, category, total_count, confirmed_count, checked_in_count)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (event_id, category) DO UPDATE
            SET total_count = EXCLUDED.total_count,
                confirmed_count = EXCLUDED.confirmed_count,
                checked_in_count = EXCLUDED.checked_in_count,
                updated_at = NOW()
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.event_id,
            data.category,
            data.total_count,
            data.confirmed_count,
            data.checked_in_count
        ]);
        return GuestCategoryAnalytics.fromRow(result.rows[0]);
    }

    async getCategoryAnalyticsByEvent(eventId, companyId) {
        const query = `SELECT * FROM guest_category_analytics WHERE event_id = $1 AND company_id = $2;`;
        const result = await pool.query(query, [eventId, companyId]);
        return result.rows.map(row => GuestCategoryAnalytics.fromRow(row));
    }

    async createOrUpdateAttendanceTrend(data, client = pool) {
        const query = `
            INSERT INTO attendance_trends (company_id, event_id, time_bucket, checkin_count)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (event_id, time_bucket) DO UPDATE
            SET checkin_count = EXCLUDED.checkin_count, updated_at = NOW()
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.event_id,
            data.time_bucket,
            data.checkin_count
        ]);
        return AttendanceTrend.fromRow(result.rows[0]);
    }

    async getAttendanceTrendsByEvent(eventId, companyId) {
        const query = `SELECT * FROM attendance_trends WHERE event_id = $1 AND company_id = $2 ORDER BY time_bucket ASC;`;
        const result = await pool.query(query, [eventId, companyId]);
        return result.rows.map(row => AttendanceTrend.fromRow(row));
    }

    async createOrUpdateSatisfaction(data, client = pool) {
        const query = `
            INSERT INTO satisfaction_analytics (company_id, event_id, average_score, total_responses)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (event_id) DO UPDATE
            SET average_score = EXCLUDED.average_score, total_responses = EXCLUDED.total_responses, updated_at = NOW()
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.event_id,
            data.average_score,
            data.total_responses
        ]);
        return SatisfactionAnalytics.fromRow(result.rows[0]);
    }

    async getSatisfactionByEvent(eventId, companyId) {
        const query = `SELECT * FROM satisfaction_analytics WHERE event_id = $1 AND company_id = $2;`;
        const result = await pool.query(query, [eventId, companyId]);
        return SatisfactionAnalytics.fromRow(result.rows[0]);
    }

    // ==========================================
    // 6. Dynamic Guest Report Builder Query
    // ==========================================
    async getDynamicGuestData(companyId, eventId, filters = {}, sorts = {}) {
        let selectFields = `
            g.guest_id,
            g.name as guest_name,
            g.email as guest_email,
            g.phone as guest_phone,
            g.category as guest_category,
            COALESCE(r.status, 'Pending') as rsvp_status,
            mp.dietary_type as meal_preference,
            ht.hotel_name as hotel_selection,
            rm.room_number,
            cr.checkin_time,
            NULL::VARCHAR as flight_number
        `;

        let query = `
            SELECT ${selectFields}
            FROM event_guest eg
            JOIN guest g ON eg.guest_id = g.guest_id
            LEFT JOIN rsvp r ON eg.event_guest_id = r.event_guest_id
            LEFT JOIN meal_pref mp ON g.guest_id = mp.guest_id
            LEFT JOIN accommodation_reservations ar ON g.guest_id = ar.guest_id AND ar.reservation_status != 'Cancelled'
            LEFT JOIN rooms rm ON ar.room_id = rm.room_id
            LEFT JOIN hotels ht ON ar.hotel_id = ht.hotel_id
            LEFT JOIN checkin_records cr ON g.guest_id = cr.guest_id AND cr.event_id = eg.event_id
            LEFT JOIN guest_transport_allocations gt ON g.guest_id = gt.guest_id
            WHERE eg.event_id = $1 AND g.company_id = $2
        `;

        const values = [eventId, companyId];
        let paramCount = 2;

        // Apply filters
        if (filters.category) {
            paramCount++;
            query += ` AND g.category = $${paramCount}`;
            values.push(filters.category);
        }
        if (filters.rsvp_status) {
            paramCount++;
            query += ` AND COALESCE(r.status, 'Pending') = $${paramCount}`;
            values.push(filters.rsvp_status);
        }
        if (filters.meal_preference) {
            paramCount++;
            query += ` AND mp.dietary_type = $${paramCount}`;
            values.push(filters.meal_preference);
        }
        if (filters.hotel_selection) {
            paramCount++;
            query += ` AND ht.hotel_name = $${paramCount}`;
            values.push(filters.hotel_selection);
        }

        // Apply dynamic sorting
        const allowedSortColumns = {
            guest_name: 'g.name',
            guest_email: 'g.email',
            guest_category: 'g.category',
            rsvp_status: "COALESCE(r.status, 'Pending')"
        };

        if (sorts.column && allowedSortColumns[sorts.column]) {
            const dir = sorts.direction === 'DESC' ? 'DESC' : 'ASC';
            query += ` ORDER BY ${allowedSortColumns[sorts.column]} ${dir}`;
        } else {
            query += ` ORDER BY g.name ASC`;
        }

        const result = await pool.query(query, values);
        return result.rows;
    }
}

module.exports = new GuestReportingRepository();
