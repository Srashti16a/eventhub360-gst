const pool = require('../config/db');
const TableLayout = require('./TableLayout');
const SeatingZone = require('./SeatingZone');
const EventTable = require('./EventTable');
const Seat = require('./Seat');
const TableAssignment = require('./TableAssignment');
const LayoutRule = require('./LayoutRule');
const LayoutValidationLog = require('./LayoutValidationLog');

class SeatingRepository {
    // ==========================================
    // 1. Table Layouts
    // ==========================================
    async getLayoutById(layoutId, companyId) {
        const query = `
            SELECT * FROM table_layouts 
            WHERE layout_id = $1 AND company_id = $2 AND is_active = TRUE;
        `;
        const result = await pool.query(query, [layoutId, companyId]);
        return TableLayout.fromRow(result.rows[0]);
    }

    async getLayoutsByEvent(eventId, companyId) {
        const query = `
            SELECT * FROM table_layouts 
            WHERE event_id = $1 AND company_id = $2 AND is_active = TRUE 
            ORDER BY created_at DESC;
        `;
        const result = await pool.query(query, [eventId, companyId]);
        return result.rows.map(row => TableLayout.fromRow(row));
    }

    async createLayout(data) {
        const query = `
            INSERT INTO table_layouts (company_id, branch_id, event_id, name, version, status, is_active, created_by, updated_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;
        const values = [
            data.company_id,
            data.branch_id || null,
            data.event_id,
            data.name,
            data.version || '1.0.0',
            data.status || 'Draft',
            data.is_active !== undefined ? data.is_active : true,
            data.created_by || null,
            data.updated_by || null
        ];
        const result = await pool.query(query, values);
        return TableLayout.fromRow(result.rows[0]);
    }

    async updateLayoutStatus(layoutId, status, companyId, updatedBy = null) {
        const query = `
            UPDATE table_layouts 
            SET status = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
            WHERE layout_id = $3 AND company_id = $4
            RETURNING *;
        `;
        const result = await pool.query(query, [status, updatedBy, layoutId, companyId]);
        return TableLayout.fromRow(result.rows[0]);
    }

    async deleteLayout(layoutId, companyId) {
        const query = `
            UPDATE table_layouts 
            SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
            WHERE layout_id = $1 AND company_id = $2;
        `;
        await pool.query(query, [layoutId, companyId]);
        return true;
    }

    // ==========================================
    // 2. Seating Zones
    // ==========================================
    async getZonesByLayout(layoutId, companyId) {
        const query = `
            SELECT * FROM seating_zones 
            WHERE layout_id = $1 AND company_id = $2 
            ORDER BY name ASC;
        `;
        const result = await pool.query(query, [layoutId, companyId]);
        return result.rows.map(row => SeatingZone.fromRow(row));
    }

    async createZone(data) {
        const query = `
            INSERT INTO seating_zones (company_id, branch_id, layout_id, name, color_code)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [
            data.company_id,
            data.branch_id || null,
            data.layout_id,
            data.name,
            data.color_code || '#E2E8F0'
        ];
        const result = await pool.query(query, values);
        return SeatingZone.fromRow(result.rows[0]);
    }

    async deleteZone(zoneId, companyId) {
        const query = `
            DELETE FROM seating_zones 
            WHERE zone_id = $1 AND company_id = $2;
        `;
        const result = await pool.query(query, [zoneId, companyId]);
        return result.rowCount > 0;
    }

    // ==========================================
    // 3. Event Tables
    // ==========================================
    async getTablesByLayout(layoutId, companyId) {
        const query = `
            SELECT t.*, z.name as zone_name, z.color_code as zone_color 
            FROM event_tables t
            LEFT JOIN seating_zones z ON t.zone_id = z.zone_id
            WHERE t.layout_id = $1 AND t.company_id = $2
            ORDER BY t.table_number ASC;
        `;
        const result = await pool.query(query, [layoutId, companyId]);
        return result.rows.map(row => EventTable.fromRow(row));
    }

    async createTable(data) {
        const query = `
            INSERT INTO event_tables (company_id, branch_id, layout_id, zone_id, table_number, shape, capacity, is_vip, x_coordinate, y_coordinate, rotation, width, height)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *;
        `;
        const values = [
            data.company_id,
            data.branch_id || null,
            data.layout_id,
            data.zone_id || null,
            data.table_number,
            data.shape || 'Round',
            data.capacity || 8,
            data.is_vip || false,
            data.x_coordinate || 0.00,
            data.y_coordinate || 0.00,
            data.rotation || 0.00,
            data.width || null,
            data.height || null
        ];
        const result = await pool.query(query, values);
        return EventTable.fromRow(result.rows[0]);
    }

    async updateTable(tableId, data, companyId) {
        const query = `
            UPDATE event_tables 
            SET zone_id = COALESCE($1, zone_id),
                table_number = COALESCE($2, table_number),
                shape = COALESCE($3, shape),
                capacity = COALESCE($4, capacity),
                is_vip = COALESCE($5, is_vip),
                x_coordinate = COALESCE($6, x_coordinate),
                y_coordinate = COALESCE($7, y_coordinate),
                rotation = COALESCE($8, rotation),
                width = COALESCE($9, width),
                height = COALESCE($10, height),
                updated_at = CURRENT_TIMESTAMP
            WHERE table_id = $11 AND company_id = $12
            RETURNING *;
        `;
        const values = [
            data.zone_id,
            data.table_number,
            data.shape,
            data.capacity,
            data.is_vip,
            data.x_coordinate,
            data.y_coordinate,
            data.rotation,
            data.width,
            data.height,
            tableId,
            companyId
        ];
        const result = await pool.query(query, values);
        return EventTable.fromRow(result.rows[0]);
    }

    async bulkUpdateTablePositions(tables, companyId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const query = `
                UPDATE event_tables 
                SET x_coordinate = $1, y_coordinate = $2, rotation = COALESCE($3, rotation), updated_at = CURRENT_TIMESTAMP
                WHERE table_id = $4 AND company_id = $5;
            `;
            for (const table of tables) {
                await client.query(query, [table.x_coordinate, table.y_coordinate, table.rotation, table.table_id, companyId]);
            }
            await client.query('COMMIT');
            return true;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    async deleteTable(tableId, companyId) {
        const query = `
            DELETE FROM event_tables 
            WHERE table_id = $1 AND company_id = $2;
        `;
        const result = await pool.query(query, [tableId, companyId]);
        return result.rowCount > 0;
    }

    // ==========================================
    // 4. Seats
    // ==========================================
    async getSeatsByTable(tableId) {
        const query = `
            SELECT * FROM seats 
            WHERE table_id = $1 
            ORDER BY seat_number ASC;
        `;
        const result = await pool.query(query, [tableId]);
        return result.rows.map(row => Seat.fromRow(row));
    }

    async bulkCreateSeats(seatsList) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const query = `
                INSERT INTO seats (table_id, seat_number, offset_x, offset_y, is_blocked)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (table_id, seat_number) DO UPDATE 
                SET offset_x = EXCLUDED.offset_x, offset_y = EXCLUDED.offset_y, is_blocked = EXCLUDED.is_blocked
                RETURNING *;
            `;
            const created = [];
            for (const seat of seatsList) {
                const res = await client.query(query, [seat.table_id, seat.seat_number, seat.offset_x || 0.00, seat.offset_y || 0.00, seat.is_blocked || false]);
                created.push(Seat.fromRow(res.rows[0]));
            }
            await client.query('COMMIT');
            return created;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    async deleteSeatsForTable(tableId) {
        const query = `DELETE FROM seats WHERE table_id = $1;`;
        await pool.query(query, [tableId]);
    }

    // ==========================================
    // 5. Assignments
    // ==========================================
    async getAssignmentsByLayout(layoutId, companyId) {
        const query = `
            SELECT ta.*, g.name as guest_name, g.category as guest_category, et.table_number, s.seat_number
            FROM table_assignments ta
            JOIN event_tables et ON ta.table_id = et.table_id
            LEFT JOIN seats s ON ta.seat_id = s.seat_id
            JOIN guest g ON ta.guest_id = g.guest_id
            WHERE ta.layout_id = $1 AND ta.company_id = $2;
        `;
        const result = await pool.query(query, [layoutId, companyId]);
        return result.rows.map(row => TableAssignment.fromRow(row));
    }

    async assignGuest(data) {
        const query = `
            INSERT INTO table_assignments (company_id, layout_id, table_id, seat_id, guest_id, assigned_by)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (layout_id, guest_id) DO UPDATE 
            SET table_id = EXCLUDED.table_id, seat_id = EXCLUDED.seat_id, assigned_by = EXCLUDED.assigned_by, assigned_at = CURRENT_TIMESTAMP
            RETURNING *;
        `;
        const values = [
            data.company_id,
            data.layout_id,
            data.table_id,
            data.seat_id,
            data.guest_id,
            data.assigned_by
        ];
        const result = await pool.query(query, values);
        return TableAssignment.fromRow(result.rows[0]);
    }

    async removeGuestAssignment(layoutId, guestId, companyId) {
        const query = `
            DELETE FROM table_assignments 
            WHERE layout_id = $1 AND guest_id = $2 AND company_id = $3;
        `;
        const result = await pool.query(query, [layoutId, guestId, companyId]);
        return result.rowCount > 0;
    }

    // ==========================================
    // 6. Layout Rules and Validations
    // ==========================================
    async getRulesByEvent(eventId, companyId) {
        const query = `
            SELECT * FROM layout_rules 
            WHERE event_id = $1 AND company_id = $2 AND is_enabled = TRUE;
        `;
        const result = await pool.query(query, [eventId, companyId]);
        return result.rows.map(row => LayoutRule.fromRow(row));
    }

    async getValidationLogsByLayout(layoutId, companyId) {
        const query = `
            SELECT vl.*, lr.rule_name 
            FROM layout_validation_logs vl
            LEFT JOIN layout_rules lr ON vl.rule_id = lr.rule_id
            WHERE vl.layout_id = $1 AND vl.company_id = $2
            ORDER BY vl.created_at DESC;
        `;
        const result = await pool.query(query, [layoutId, companyId]);
        return result.rows.map(row => LayoutValidationLog.fromRow(row));
    }

    async clearValidationLogs(layoutId, companyId) {
        const query = `
            DELETE FROM layout_validation_logs 
            WHERE layout_id = $1 AND company_id = $2;
        `;
        await pool.query(query, [layoutId, companyId]);
    }

    async logValidationFailure(data) {
        const query = `
            INSERT INTO layout_validation_logs (company_id, layout_id, rule_id, severity, message, details)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [
            data.company_id,
            data.layout_id,
            data.rule_id || null,
            data.severity || 'Warning',
            data.message,
            data.details || '{}'
        ];
        const result = await pool.query(query, values);
        return LayoutValidationLog.fromRow(result.rows[0]);
    }

    // ==========================================
    // 7. Analytics & Dashboard stats
    // ==========================================
    async getSeatingStats(eventId, layoutId, companyId) {
        // Query total tables
        const totalTablesQuery = `SELECT COUNT(*)::INTEGER FROM event_tables WHERE layout_id = $1;`;
        const totalTablesRes = await pool.query(totalTablesQuery, [layoutId]);

        // Query active tables (tables having at least 1 seated guest)
        const activeTablesQuery = `
            SELECT COUNT(DISTINCT table_id)::INTEGER 
            FROM table_assignments 
            WHERE layout_id = $1;
        `;
        const activeTablesRes = await pool.query(activeTablesQuery, [layoutId]);

        // Max Capacity (sum of table capacity)
        const maxCapacityQuery = `
            SELECT COALESCE(SUM(capacity), 0)::INTEGER 
            FROM event_tables 
            WHERE layout_id = $1;
        `;
        const maxCapacityRes = await pool.query(maxCapacityQuery, [layoutId]);

        // Assigned count
        const assignedQuery = `
            SELECT COUNT(*)::INTEGER 
            FROM table_assignments 
            WHERE layout_id = $1 AND company_id = $2;
        `;
        const assignedRes = await pool.query(assignedQuery, [layoutId, companyId]);

        // Total invited guests for the event (unassigned count = total invited - assigned)
        const totalInvitedQuery = `
            SELECT COALESCE(COUNT(eg.event_guest_id), 0)::INTEGER as total_invited
            FROM event_guest eg
            JOIN guest g ON eg.guest_id = g.guest_id
            WHERE eg.event_id = $1 AND g.company_id = $2;
        `;
        const totalInvitedRes = await pool.query(totalInvitedQuery, [eventId, companyId]);
        const totalInvited = totalInvitedRes.rows[0].total_invited;

        const totalTables = totalTablesRes.rows[0].count;
        const activeTablesCount = activeTablesRes.rows[0].count;
        const maxCapacity = maxCapacityRes.rows[0].coalesce;
        const assignedCount = assignedRes.rows[0].count;
        const unassignedCount = Math.max(0, totalInvited - assignedCount);

        return {
            totalTables,
            activeTablesCount,
            maxCapacity,
            assignedCount,
            unassignedCount
        };
    }
}

module.exports = new SeatingRepository();
