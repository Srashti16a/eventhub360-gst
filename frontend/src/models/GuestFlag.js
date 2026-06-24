/**
 * GuestFlag Entity Model
 */
class GuestFlag {
    /**
     * @param {Object} params
     * @param {number} [params.flag_id]
     * @param {number} params.guest_id
     * @param {number} params.event_id
     * @param {string} params.flag_reason
     * @param {'Flagged' | 'Reviewed' | 'Resolved'} [params.flag_status]
     * @param {number} [params.reviewed_by]
     * @param {Date|string} [params.created_at]
     * 
     * // Joined parameters
     * @param {string} [params.guest_name]
     * @param {string} [params.reviewer_name]
     */
    constructor({
        flag_id,
        guest_id,
        event_id,
        flag_reason,
        flag_status = 'Flagged',
        reviewed_by = null,
        created_at,
        guest_name = null,
        reviewer_name = null
    }) {
        this.flag_id = flag_id ? Number(flag_id) : undefined;
        this.guest_id = Number(guest_id);
        this.event_id = Number(event_id);
        this.flag_reason = flag_reason;
        this.flag_status = flag_status;
        this.reviewed_by = reviewed_by ? Number(reviewed_by) : null;
        this.created_at = created_at ? new Date(created_at) : undefined;

        // Joined properties
        this.guest_name = guest_name;
        this.reviewer_name = reviewer_name;
    }

    /**
     * Map database row directly to GuestFlag Entity instance
     * @param {Object} row 
     * @returns {GuestFlag}
     */
    static fromRow(row) {
        if (!row) return null;
        return new GuestFlag({
            flag_id: row.flag_id,
            guest_id: row.guest_id,
            event_id: row.event_id,
            flag_reason: row.flag_reason,
            flag_status: row.flag_status,
            reviewed_by: row.reviewed_by,
            created_at: row.created_at,
            guest_name: row.guest_name,
            reviewer_name: row.reviewer_name
        });
    }
}

module.exports = GuestFlag;
