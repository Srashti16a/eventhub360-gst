const pool = require('../config/db');
const BadgePrinter = require('./BadgePrinter');
const BadgeTemplate = require('./BadgeTemplate');
const BadgePrintJob = require('./BadgePrintJob');
const PrintQueue = require('./PrintQueue');
const PrinterAlert = require('./PrinterAlert');
const BadgePrintLog = require('./BadgePrintLog');
const BadgeConfiguration = require('./BadgeConfiguration');
const BadgeBatch = require('./BadgeBatch');

class BadgePrintingRepository {
    // ==========================================
    // 1. Badge Printers
    // ==========================================
    async createPrinter(data, client = pool) {
        const query = `
            INSERT INTO badge_printers (company_id, branch_id, printer_name, printer_code, location, status, paper_status, last_seen)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.branch_id || null,
            data.printer_name,
            data.printer_code,
            data.location || null,
            data.status || 'Online',
            data.paper_status || 'OK',
            data.last_seen || new Date()
        ]);
        return BadgePrinter.fromRow(result.rows[0]);
    }

    async findPrinterById(id, companyId) {
        const query = `SELECT * FROM badge_printers WHERE id = $1 AND company_id = $2;`;
        const result = await pool.query(query, [id, companyId]);
        return BadgePrinter.fromRow(result.rows[0]);
    }

    async findPrinterByCode(code, companyId) {
        const query = `SELECT * FROM badge_printers WHERE printer_code = $1 AND company_id = $2;`;
        const result = await pool.query(query, [code, companyId]);
        return BadgePrinter.fromRow(result.rows[0]);
    }

    async findAllPrinters(companyId) {
        const query = `SELECT * FROM badge_printers WHERE company_id = $1 ORDER BY printer_name ASC;`;
        const result = await pool.query(query, [companyId]);
        return result.rows.map(row => BadgePrinter.fromRow(row));
    }

    async updatePrinterStatus(id, companyId, status, paperStatus, client = pool) {
        const query = `
            UPDATE badge_printers 
            SET status = $1, paper_status = $2, last_seen = NOW(), updated_at = NOW()
            WHERE id = $3 AND company_id = $4
            RETURNING *;
        `;
        const result = await client.query(query, [status, paperStatus, id, companyId]);
        return BadgePrinter.fromRow(result.rows[0]);
    }

    async updatePrinterLastSeen(id, companyId, client = pool) {
        const query = `
            UPDATE badge_printers 
            SET last_seen = NOW()
            WHERE id = $1 AND company_id = $2;
        `;
        await client.query(query, [id, companyId]);
    }

    async updatePrinter(id, companyId, data, client = pool) {
        const setFields = [];
        const values = [id, companyId];
        let paramCount = 2;

        const fields = ['printer_name', 'location', 'status', 'paper_status'];
        for (const field of fields) {
            if (data[field] !== undefined) {
                paramCount++;
                setFields.push(`${field} = $${paramCount}`);
                values.push(data[field]);
            }
        }

        if (setFields.length === 0) {
            return this.findPrinterById(id, companyId);
        }

        setFields.push(`updated_at = NOW()`);
        const query = `
            UPDATE badge_printers
            SET ${setFields.join(', ')}
            WHERE id = $1 AND company_id = $2
            RETURNING *;
        `;
        const result = await client.query(query, values);
        return BadgePrinter.fromRow(result.rows[0]);
    }

    // ==========================================
    // 2. Badge Templates
    // ==========================================
    async createTemplate(data, client = pool) {
        const query = `
            INSERT INTO badge_templates (company_id, branch_id, event_id, template_name, orientation, card_size, include_qr, include_logo, show_job_title, center_alignment)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.branch_id || null,
            data.event_id,
            data.template_name,
            data.orientation || 'Portrait',
            data.card_size || '4x6',
            data.include_qr !== undefined ? data.include_qr : true,
            data.include_logo !== undefined ? data.include_logo : true,
            data.show_job_title !== undefined ? data.show_job_title : false,
            data.center_alignment !== undefined ? data.center_alignment : true
        ]);
        return BadgeTemplate.fromRow(result.rows[0]);
    }

    async findTemplateById(id, companyId) {
        const query = `SELECT * FROM badge_templates WHERE id = $1 AND company_id = $2;`;
        const result = await pool.query(query, [id, companyId]);
        return BadgeTemplate.fromRow(result.rows[0]);
    }

    async findAllTemplates(companyId, eventId, { limit = 10, offset = 0 } = {}) {
        const query = `
            SELECT * FROM badge_templates 
            WHERE company_id = $1 AND event_id = $2
            ORDER BY created_at DESC
            LIMIT $3 OFFSET $4;
        `;
        const result = await pool.query(query, [companyId, eventId, limit, offset]);
        return result.rows.map(row => BadgeTemplate.fromRow(row));
    }

    async countTemplates(companyId, eventId) {
        const query = `SELECT COUNT(*)::INTEGER FROM badge_templates WHERE company_id = $1 AND event_id = $2;`;
        const result = await pool.query(query, [companyId, eventId]);
        return result.rows[0].count;
    }

    async updateTemplate(id, companyId, data, client = pool) {
        const setFields = [];
        const values = [id, companyId];
        let paramCount = 2;

        const fields = ['template_name', 'orientation', 'card_size', 'include_qr', 'include_logo', 'show_job_title', 'center_alignment'];
        for (const field of fields) {
            if (data[field] !== undefined) {
                paramCount++;
                setFields.push(`${field} = $${paramCount}`);
                values.push(data[field]);
            }
        }

        if (setFields.length === 0) {
            return this.findTemplateById(id, companyId);
        }

        setFields.push(`updated_at = NOW()`);
        const query = `
            UPDATE badge_templates
            SET ${setFields.join(', ')}
            WHERE id = $1 AND company_id = $2
            RETURNING *;
        `;
        const result = await client.query(query, values);
        return BadgeTemplate.fromRow(result.rows[0]);
    }

    async deleteTemplate(id, companyId, client = pool) {
        const query = `DELETE FROM badge_templates WHERE id = $1 AND company_id = $2;`;
        const result = await client.query(query, [id, companyId]);
        return result.rowCount > 0;
    }

    // ==========================================
    // 3. Badge Print Jobs
    // ==========================================
    async createPrintJob(data, client = pool) {
        const query = `
            INSERT INTO badge_print_jobs (company_id, guest_id, template_id, printer_id, job_status, priority, requested_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.guest_id,
            data.template_id || null,
            data.printer_id || null,
            data.job_status || 'Pending',
            data.priority || 1,
            data.requested_at || new Date()
        ]);
        return BadgePrintJob.fromRow(result.rows[0]);
    }

    async findPrintJobById(id, companyId) {
        const query = `
            SELECT j.*, g.name as guest_name, g.email as guest_email, g.category as guest_role,
                   p.printer_name, t.template_name, q.queue_position
            FROM badge_print_jobs j
            JOIN guest g ON j.guest_id = g.guest_id
            LEFT JOIN badge_printers p ON j.printer_id = p.id
            LEFT JOIN badge_templates t ON j.template_id = t.id
            LEFT JOIN print_queues q ON j.id = q.print_job_id
            WHERE j.id = $1 AND j.company_id = $2;
        `;
        const result = await pool.query(query, [id, companyId]);
        return BadgePrintJob.fromRow(result.rows[0]);
    }

    async updatePrintJobStatus(id, companyId, status, completedAt = null, client = pool) {
        const query = `
            UPDATE badge_print_jobs 
            SET job_status = $1, completed_at = $2
            WHERE id = $3 AND company_id = $4
            RETURNING *;
        `;
        const result = await client.query(query, [status, completedAt, id, companyId]);
        return BadgePrintJob.fromRow(result.rows[0]);
    }

    async updatePrintJobPrinter(id, companyId, printerId, client = pool) {
        const query = `
            UPDATE badge_print_jobs 
            SET printer_id = $1
            WHERE id = $2 AND company_id = $3
            RETURNING *;
        `;
        const result = await client.query(query, [printerId, id, companyId]);
        return BadgePrintJob.fromRow(result.rows[0]);
    }

    async findAllPrintJobs(companyId, { limit = 10, offset = 0, status, printerId } = {}) {
        let query = `
            SELECT j.*, g.name as guest_name, g.email as guest_email, g.category as guest_role,
                   p.printer_name, t.template_name, q.queue_position
            FROM badge_print_jobs j
            JOIN guest g ON j.guest_id = g.guest_id
            LEFT JOIN badge_printers p ON j.printer_id = p.id
            LEFT JOIN badge_templates t ON j.template_id = t.id
            LEFT JOIN print_queues q ON j.id = q.print_job_id
            WHERE j.company_id = $1
        `;
        const values = [companyId];
        let paramCount = 1;

        if (status) {
            paramCount++;
            query += ` AND j.job_status = $${paramCount}`;
            values.push(status);
        }
        if (printerId) {
            paramCount++;
            query += ` AND j.printer_id = $${paramCount}`;
            values.push(printerId);
        }

        paramCount++;
        query += ` ORDER BY j.requested_at DESC LIMIT $${paramCount}`;
        values.push(limit);

        paramCount++;
        query += ` OFFSET $${paramCount}`;
        values.push(offset);

        const result = await pool.query(query, values);
        return result.rows.map(row => BadgePrintJob.fromRow(row));
    }

    async countPrintJobs(companyId, { status, printerId } = {}) {
        let query = `
            SELECT COUNT(*)::INTEGER 
            FROM badge_print_jobs j
            WHERE j.company_id = $1
        `;
        const values = [companyId];
        let paramCount = 1;

        if (status) {
            paramCount++;
            query += ` AND j.job_status = $${paramCount}`;
            values.push(status);
        }
        if (printerId) {
            paramCount++;
            query += ` AND j.printer_id = $${paramCount}`;
            values.push(printerId);
        }

        const result = await pool.query(query, values);
        return result.rows[0].count;
    }

    // ==========================================
    // 4. Print Queue Operations
    // ==========================================
    async getQueueItems(companyId) {
        const query = `
            SELECT q.*, j.id as job_id, j.guest_id, j.template_id, j.printer_id, j.job_status, j.priority, j.requested_at,
                   g.name as guest_name, g.email as guest_email, g.category as guest_role,
                   p.printer_name, t.template_name
            FROM print_queues q
            JOIN badge_print_jobs j ON q.print_job_id = j.id
            JOIN guest g ON j.guest_id = g.guest_id
            LEFT JOIN badge_printers p ON j.printer_id = p.id
            LEFT JOIN badge_templates t ON j.template_id = t.id
            WHERE q.company_id = $1
            ORDER BY q.queue_position ASC;
        `;
        const result = await pool.query(query, [companyId]);
        return result.rows.map(row => {
            const q = PrintQueue.fromRow(row);
            q.job = BadgePrintJob.fromRow({
                id: row.job_id,
                company_id: row.company_id,
                guest_id: row.guest_id,
                template_id: row.template_id,
                printer_id: row.printer_id,
                job_status: row.job_status,
                priority: row.priority,
                requested_at: row.requested_at,
                guest_name: row.guest_name,
                guest_email: row.guest_email,
                guest_role: row.guest_role,
                printer_name: row.printer_name,
                template_name: row.template_name,
                queue_position: row.queue_position
            });
            return q;
        });
    }

    async getMaxQueuePosition(companyId, client = pool) {
        const query = `SELECT COALESCE(MAX(queue_position), 0) as max_pos FROM print_queues WHERE company_id = $1;`;
        const result = await client.query(query, [companyId]);
        return result.rows[0].max_pos;
    }

    async addToQueue(companyId, printJobId, client = pool) {
        const nextPos = await this.getMaxQueuePosition(companyId, client) + 1;
        const query = `
            INSERT INTO print_queues (company_id, print_job_id, queue_position, status)
            VALUES ($1, $2, $3, 'Pending')
            ON CONFLICT (company_id, print_job_id) DO UPDATE 
            SET queue_position = EXCLUDED.queue_position
            RETURNING *;
        `;
        const result = await client.query(query, [companyId, printJobId, nextPos]);
        return PrintQueue.fromRow(result.rows[0]);
    }

    async updateQueuePosition(id, companyId, position, client = pool) {
        const query = `
            UPDATE print_queues 
            SET queue_position = $1 
            WHERE id = $2 AND company_id = $3
            RETURNING *;
        `;
        const result = await client.query(query, [position, id, companyId]);
        return PrintQueue.fromRow(result.rows[0]);
    }

    async updateQueueStatus(printJobId, companyId, status, client = pool) {
        const query = `
            UPDATE print_queues
            SET status = $1
            WHERE print_job_id = $2 AND company_id = $3;
        `;
        await client.query(query, [status, printJobId, companyId]);
    }

    async removeFromQueue(printJobId, companyId, client = pool) {
        const query = `DELETE FROM print_queues WHERE print_job_id = $1 AND company_id = $2;`;
        const result = await client.query(query, [printJobId, companyId]);
        return result.rowCount > 0;
    }

    async clearQueue(companyId, client = pool) {
        const query = `DELETE FROM print_queues WHERE company_id = $1;`;
        await client.query(query, [companyId]);
    }

    async findQueueItemByJobId(printJobId, companyId) {
        const query = `SELECT * FROM print_queues WHERE print_job_id = $1 AND company_id = $2;`;
        const result = await pool.query(query, [printJobId, companyId]);
        return PrintQueue.fromRow(result.rows[0]);
    }

    // ==========================================
    // 5. Printer Alerts
    // ==========================================
    async createAlert(data, client = pool) {
        const query = `
            INSERT INTO printer_alerts (company_id, printer_id, alert_type, severity, message, status)
            VALUES ($1, $2, $3, $4, $5, 'Active')
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.printer_id,
            data.alert_type,
            data.severity,
            data.message
        ]);
        return PrinterAlert.fromRow(result.rows[0]);
    }

    async getActiveAlerts(companyId) {
        const query = `
            SELECT a.*, p.printer_name 
            FROM printer_alerts a
            JOIN badge_printers p ON a.printer_id = p.id
            WHERE a.company_id = $1 AND a.status = 'Active'
            ORDER BY a.created_at DESC;
        `;
        const result = await pool.query(query, [companyId]);
        return result.rows.map(row => PrinterAlert.fromRow(row));
    }

    async resolveAlert(id, companyId, client = pool) {
        const query = `
            UPDATE printer_alerts
            SET status = 'Resolved'
            WHERE id = $1 AND company_id = $2
            RETURNING *;
        `;
        const result = await client.query(query, [id, companyId]);
        return PrinterAlert.fromRow(result.rows[0]);
    }

    async resolveAlertsForPrinter(printerId, companyId, client = pool) {
        const query = `
            UPDATE printer_alerts
            SET status = 'Resolved'
            WHERE printer_id = $1 AND company_id = $2 AND status = 'Active';
        `;
        await client.query(query, [printerId, companyId]);
    }

    // ==========================================
    // 6. Badge Print Logs
    // ==========================================
    async createLog(data, client = pool) {
        const query = `
            INSERT INTO badge_print_logs (company_id, print_job_id, printer_id, action, performed_by)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.print_job_id || null,
            data.printer_id || null,
            data.action,
            data.performed_by || null
        ]);
        return BadgePrintLog.fromRow(result.rows[0]);
    }

    async getLogs(companyId, { limit = 10, offset = 0, printerId } = {}) {
        let query = `
            SELECT l.*, p.printer_name, g.name as guest_name
            FROM badge_print_logs l
            LEFT JOIN badge_printers p ON l.printer_id = p.id
            LEFT JOIN badge_print_jobs j ON l.print_job_id = j.id
            LEFT JOIN guest g ON j.guest_id = g.guest_id
            WHERE l.company_id = $1
        `;
        const values = [companyId];
        let paramCount = 1;

        if (printerId) {
            paramCount++;
            query += ` AND l.printer_id = $${paramCount}`;
            values.push(printerId);
        }

        paramCount++;
        query += ` ORDER BY l.created_at DESC LIMIT $${paramCount}`;
        values.push(limit);

        paramCount++;
        query += ` OFFSET $${paramCount}`;
        values.push(offset);

        const result = await pool.query(query, values);
        return result.rows.map(row => BadgePrintLog.fromRow(row));
    }

    async countLogs(companyId, { printerId } = {}) {
        let query = `
            SELECT COUNT(*)::INTEGER 
            FROM badge_print_logs l
            WHERE l.company_id = $1
        `;
        const values = [companyId];
        let paramCount = 1;

        if (printerId) {
            paramCount++;
            query += ` AND l.printer_id = $${paramCount}`;
            values.push(printerId);
        }

        const result = await pool.query(query, values);
        return result.rows[0].count;
    }

    // ==========================================
    // 7. Configurations
    // ==========================================
    async getConfiguration(eventId, companyId) {
        const query = `SELECT * FROM badge_configurations WHERE event_id = $1 AND company_id = $2;`;
        const result = await pool.query(query, [eventId, companyId]);
        return BadgeConfiguration.fromRow(result.rows[0]);
    }

    async saveConfiguration(data, client = pool) {
        const query = `
            INSERT INTO badge_configurations (company_id, event_id, default_template_id, auto_generate_qr, auto_print_on_checkin)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (company_id, event_id) DO UPDATE 
            SET default_template_id = EXCLUDED.default_template_id,
                auto_generate_qr = EXCLUDED.auto_generate_qr,
                auto_print_on_checkin = EXCLUDED.auto_print_on_checkin,
                updated_at = NOW()
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.event_id,
            data.default_template_id || null,
            data.auto_generate_qr !== undefined ? data.auto_generate_qr : true,
            data.auto_print_on_checkin !== undefined ? data.auto_print_on_checkin : false
        ]);
        return BadgeConfiguration.fromRow(result.rows[0]);
    }

    // ==========================================
    // 8. Badge Batches
    // ==========================================
    async createBatch(data, client = pool) {
        const query = `
            INSERT INTO badge_batches (company_id, event_id, batch_name, total_badges, generated_count, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const result = await client.query(query, [
            data.company_id,
            data.event_id,
            data.batch_name,
            data.total_badges,
            data.generated_count || 0,
            data.status || 'Pending'
        ]);
        return BadgeBatch.fromRow(result.rows[0]);
    }

    async findBatchById(id, companyId) {
        const query = `SELECT * FROM badge_batches WHERE id = $1 AND company_id = $2;`;
        const result = await pool.query(query, [id, companyId]);
        return BadgeBatch.fromRow(result.rows[0]);
    }

    async updateBatchProgress(id, companyId, generatedCount, status, client = pool) {
        const query = `
            UPDATE badge_batches
            SET generated_count = $1, status = $2
            WHERE id = $3 AND company_id = $4
            RETURNING *;
        `;
        const result = await client.query(query, [generatedCount, status, id, companyId]);
        return BadgeBatch.fromRow(result.rows[0]);
    }

    async getBatches(companyId, { limit = 10, offset = 0 } = {}) {
        const query = `
            SELECT * FROM badge_batches
            WHERE company_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3;
        `;
        const result = await pool.query(query, [companyId, limit, offset]);
        return result.rows.map(row => BadgeBatch.fromRow(row));
    }

    async countBatches(companyId) {
        const query = `SELECT COUNT(*)::INTEGER FROM badge_batches WHERE company_id = $1;`;
        const result = await pool.query(query, [companyId]);
        return result.rows[0].count;
    }

    // ==========================================
    // 9. External Guest Lookup Helper
    // ==========================================
    async findGuestById(guestId, companyId) {
        const query = `SELECT * FROM guest WHERE guest_id = $1 AND company_id = $2;`;
        const result = await pool.query(query, [guestId, companyId]);
        return result.rows[0];
    }
}

module.exports = new BadgePrintingRepository();
