/**
 * AutoAssignmentLog Entity Model
 */
class AutoAssignmentLog {
    /**
     * @param {Object} params
     * @param {number} [params.log_id]
     * @param {number} params.guest_id
     * @param {number} params.room_id
     * @param {string} params.assignment_rule
     * @param {Date|string} [params.created_at]
     */
    constructor({
        log_id,
        guest_id,
        room_id,
        assignment_rule,
        created_at
    }) {
        this.log_id = log_id ? Number(log_id) : undefined;
        this.guest_id = Number(guest_id);
        this.room_id = Number(room_id);
        this.assignment_rule = assignment_rule;
        this.created_at = created_at ? new Date(created_at) : undefined;
    }

    /**
     * Map database row directly to AutoAssignmentLog Entity instance
     * @param {Object} row 
     * @returns {AutoAssignmentLog}
     */
    static fromRow(row) {
        if (!row) return null;
        return new AutoAssignmentLog({
            log_id: row.log_id,
            guest_id: row.guest_id,
            room_id: row.room_id,
            assignment_rule: row.assignment_rule,
            created_at: row.created_at
        });
    }
}

module.exports = AutoAssignmentLog;
