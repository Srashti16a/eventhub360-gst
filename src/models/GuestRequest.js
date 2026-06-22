/**
 * GuestRequest Entity Model
 */
class GuestRequest {
    /**
     * @param {Object} params
     * @param {number} [params.request_id]
     * @param {number} params.guest_id
     * @param {'High Floor' | 'VIP Placement' | 'King Bed' | 'Suite Upgrade' | 'Other'} params.request_type
     * @param {string} [params.request_value]
     * @param {Date|string} [params.created_at]
     */
    constructor({
        request_id,
        guest_id,
        request_type,
        request_value = null,
        created_at
    }) {
        this.request_id = request_id ? Number(request_id) : undefined;
        this.guest_id = Number(guest_id);
        this.request_type = request_type;
        this.request_value = request_value;
        this.created_at = created_at ? new Date(created_at) : undefined;
    }

    /**
     * Map database row directly to GuestRequest Entity instance
     * @param {Object} row 
     * @returns {GuestRequest}
     */
    static fromRow(row) {
        if (!row) return null;
        return new GuestRequest({
            request_id: row.request_id,
            guest_id: row.guest_id,
            request_type: row.request_type,
            request_value: row.request_value,
            created_at: row.created_at
        });
    }
}

module.exports = GuestRequest;
