/**
 * BadgePrintJob Entity Model
 */
class BadgePrintJob {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number} params.guest_id
     * @param {number|null} [params.template_id]
     * @param {number|null} [params.printer_id]
     * @param {'Pending' | 'Printing' | 'Completed' | 'Failed'} [params.job_status]
     * @param {number} [params.priority]
     * @param {Date|string} [params.requested_at]
     * @param {Date|string|null} [params.completed_at]
     * @param {Date|string} [params.created_at]
     * 
     * // Joined parameters for queue & list representation
     * @param {string} [params.guest_name]
     * @param {string} [params.guest_email]
     * @param {string} [params.guest_role] -- e.g. 'VIP', 'Staff', 'Speaker', 'Guest'
     * @param {string} [params.printer_name]
     * @param {string} [params.template_name]
     * @param {number} [params.queue_position]
     */
    constructor({
        id,
        company_id,
        guest_id,
        template_id = null,
        printer_id = null,
        job_status = 'Pending',
        priority = 1,
        requested_at,
        completed_at = null,
        created_at,
        guest_name = null,
        guest_email = null,
        guest_role = 'Guest',
        printer_name = null,
        template_name = null,
        queue_position = null
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.guest_id = Number(guest_id);
        this.template_id = template_id ? Number(template_id) : null;
        this.printer_id = printer_id ? Number(printer_id) : null;
        this.job_status = job_status;
        this.priority = Number(priority);
        this.requested_at = requested_at ? new Date(requested_at) : new Date();
        this.completed_at = completed_at ? new Date(completed_at) : null;
        this.created_at = created_at ? new Date(created_at) : undefined;

        // Joined properties
        this.guest_name = guest_name;
        this.guest_email = guest_email;
        this.guest_role = guest_role;
        this.printer_name = printer_name;
        this.template_name = template_name;
        this.queue_position = queue_position ? Number(queue_position) : null;
    }

    /**
     * Map database row directly to BadgePrintJob Entity instance
     * @param {Object} row 
     * @returns {BadgePrintJob}
     */
    static fromRow(row) {
        if (!row) return null;
        return new BadgePrintJob({
            id: row.id,
            company_id: row.company_id,
            guest_id: row.guest_id,
            template_id: row.template_id,
            printer_id: row.printer_id,
            job_status: row.job_status,
            priority: row.priority,
            requested_at: row.requested_at,
            completed_at: row.completed_at,
            created_at: row.created_at,
            guest_name: row.guest_name,
            guest_email: row.guest_email,
            guest_role: row.guest_role,
            printer_name: row.printer_name,
            template_name: row.template_name,
            queue_position: row.queue_position
        });
    }
}

module.exports = BadgePrintJob;
