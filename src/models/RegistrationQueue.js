/**
 * RegistrationQueue Entity Model
 */
class RegistrationQueue {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number} params.guest_id
     * @param {'Pending' | 'Approved' | 'Printed' | 'Failed'} [params.queue_status]
     * @param {number} [params.priority]
     * @param {Date|string} [params.created_at]
     * 
     * // Joined parameters
     * @param {string} [params.guest_name]
     * @param {string} [params.guest_email]
     * @param {string} [params.guest_company]
     * @param {string} [params.guest_category]
     */
    constructor({
        id,
        company_id,
        guest_id,
        queue_status = 'Pending',
        priority = 1,
        created_at,
        guest_name = null,
        guest_email = null,
        guest_company = null,
        guest_category = null
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.guest_id = Number(guest_id);
        this.queue_status = queue_status;
        this.priority = Number(priority);
        this.created_at = created_at ? new Date(created_at) : undefined;

        // Joined properties
        this.guest_name = guest_name;
        this.guest_email = guest_email;
        this.guest_company = guest_company;
        this.guest_category = guest_category;
    }

    /**
     * Map database row directly to RegistrationQueue Entity instance
     * @param {Object} row 
     * @returns {RegistrationQueue}
     */
    static fromRow(row) {
        if (!row) return null;
        return new RegistrationQueue({
            id: row.id,
            company_id: row.company_id,
            guest_id: row.guest_id,
            queue_status: row.queue_status,
            priority: row.priority,
            created_at: row.created_at,
            guest_name: row.guest_name,
            guest_email: row.guest_email,
            guest_company: row.guest_company,
            guest_category: row.guest_category
        });
    }
}

module.exports = RegistrationQueue;
