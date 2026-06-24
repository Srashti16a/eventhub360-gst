/**
 * BadgePrintLog Entity Model
 */
class BadgePrintLog {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number|null} [params.print_job_id]
     * @param {number|null} [params.printer_id]
     * @param {string} params.action
     * @param {number|null} [params.performed_by]
     * @param {Date|string} [params.created_at]
     * 
     * // Joined parameters
     * @param {string} [params.printer_name]
     * @param {string} [params.guest_name]
     */
    constructor({
        id,
        company_id,
        print_job_id = null,
        printer_id = null,
        action,
        performed_by = null,
        created_at,
        printer_name = null,
        guest_name = null
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.print_job_id = print_job_id ? Number(print_job_id) : null;
        this.printer_id = printer_id ? Number(printer_id) : null;
        this.action = action;
        this.performed_by = performed_by ? Number(performed_by) : null;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.printer_name = printer_name;
        this.guest_name = guest_name;
    }

    /**
     * Map database row directly to BadgePrintLog Entity instance
     * @param {Object} row 
     * @returns {BadgePrintLog}
     */
    static fromRow(row) {
        if (!row) return null;
        return new BadgePrintLog({
            id: row.id,
            company_id: row.company_id,
            print_job_id: row.print_job_id,
            printer_id: row.printer_id,
            action: row.action,
            performed_by: row.performed_by,
            created_at: row.created_at,
            printer_name: row.printer_name,
            guest_name: row.guest_name
        });
    }
}

module.exports = BadgePrintLog;
