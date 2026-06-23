/**
 * CheckInHistory Entity Model
 */
class CheckInHistory {
    /**
     * @param {Object} params
     * @param {number} [params.history_id]
     * @param {number} params.guest_id
     * @param {number} params.event_id
     * @param {string} params.action
     * @param {number} params.performed_by
     * @param {Date|string} [params.created_at]
     * 
     * // Joined parameters
     * @param {string} [params.guest_name]
     * @param {string} [params.operator_name]
     */
    constructor({
        history_id,
        guest_id,
        event_id,
        action,
        performed_by,
        created_at,
        guest_name = null,
        operator_name = null
    }) {
        this.history_id = history_id ? Number(history_id) : undefined;
        this.guest_id = Number(guest_id);
        this.event_id = Number(event_id);
        this.action = action;
        this.performed_by = Number(performed_by);
        this.created_at = created_at ? new Date(created_at) : undefined;

        // Joined properties
        this.guest_name = guest_name;
        this.operator_name = operator_name;
    }

    /**
     * Map database row directly to CheckInHistory Entity instance
     * @param {Object} row 
     * @returns {CheckInHistory}
     */
    static fromRow(row) {
        if (!row) return null;
        return new CheckInHistory({
            history_id: row.history_id,
            guest_id: row.guest_id,
            event_id: row.event_id,
            action: row.action,
            performed_by: row.performed_by,
            created_at: row.created_at,
            guest_name: row.guest_name,
            operator_name: row.operator_name
        });
    }
}

module.exports = CheckInHistory;
