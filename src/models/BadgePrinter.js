/**
 * BadgePrinter Entity Model
 */
class BadgePrinter {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number|null} [params.branch_id]
     * @param {string} params.printer_name
     * @param {string} params.printer_code
     * @param {string|null} [params.location]
     * @param {'Online' | 'Offline' | 'Paper Low' | 'Maintenance'} [params.status]
     * @param {'OK' | 'Low' | 'Empty'} [params.paper_status]
     * @param {Date|string} [params.last_seen]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     */
    constructor({
        id,
        company_id,
        branch_id = null,
        printer_name,
        printer_code,
        location = null,
        status = 'Online',
        paper_status = 'OK',
        last_seen,
        created_at,
        updated_at
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.printer_name = printer_name;
        this.printer_code = printer_code;
        this.location = location;
        this.status = status;
        this.paper_status = paper_status;
        this.last_seen = last_seen ? new Date(last_seen) : new Date();
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
    }

    /**
     * Map database row directly to BadgePrinter Entity instance
     * @param {Object} row 
     * @returns {BadgePrinter}
     */
    static fromRow(row) {
        if (!row) return null;
        return new BadgePrinter({
            id: row.id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            printer_name: row.printer_name,
            printer_code: row.printer_code,
            location: row.location,
            status: row.status,
            paper_status: row.paper_status,
            last_seen: row.last_seen,
            created_at: row.created_at,
            updated_at: row.updated_at
        });
    }
}

module.exports = BadgePrinter;
