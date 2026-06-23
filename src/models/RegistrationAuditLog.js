/**
 * RegistrationAuditLog Entity Model
 */
class RegistrationAuditLog {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number|null} [params.guest_id]
     * @param {string} params.action
     * @param {string|null} [params.performed_by]
     * @param {Date|string} [params.created_at]
     * 
     * // Joined parameters
     * @param {string} [params.guest_name]
     */
    constructor({
        id,
        company_id,
        guest_id = null,
        action,
        performed_by = null,
        created_at,
        guest_name = null
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.guest_id = guest_id ? Number(guest_id) : null;
        this.action = action;
        this.performed_by = performed_by;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.guest_name = guest_name;
    }

    /**
     * Map database row directly to RegistrationAuditLog Entity instance
     * @param {Object} row 
     * @returns {RegistrationAuditLog}
     */
    static fromRow(row) {
        if (!row) return null;
        return new RegistrationAuditLog({
            id: row.id,
            company_id: row.company_id,
            guest_id: row.guest_id,
            action: row.action,
            performed_by: row.performed_by,
            created_at: row.created_at,
            guest_name: row.guest_name
        });
    }
}

module.exports = RegistrationAuditLog;
