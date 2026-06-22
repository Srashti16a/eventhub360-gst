/**
 * WaitlistGuest Entity Model
 */
class WaitlistGuest {
    /**
     * @param {Object} params
     * @param {number} [params.waitlist_id]
     * @param {number} params.guest_id
     * @param {'Critical' | 'High' | 'Standard' | 'Low'} params.priority_level
     * @param {Date|string} params.eta
     * @param {string} [params.notes]
     * @param {Date|string} [params.created_at]
     * 
     * // Joined details
     * @param {string} [params.guest_name]
     * @param {string} [params.guest_category]
     */
    constructor({
        waitlist_id,
        guest_id,
        priority_level,
        eta,
        notes = null,
        created_at,
        guest_name = null,
        guest_category = null
    }) {
        this.waitlist_id = waitlist_id ? Number(waitlist_id) : undefined;
        this.guest_id = Number(guest_id);
        this.priority_level = priority_level;
        this.eta = eta ? new Date(eta) : undefined;
        this.notes = notes;
        this.created_at = created_at ? new Date(created_at) : undefined;

        // Joined properties
        this.guest_name = guest_name;
        this.guest_category = guest_category;
    }

    /**
     * Map database row directly to WaitlistGuest instance
     * @param {Object} row 
     * @returns {WaitlistGuest}
     */
    static fromRow(row) {
        if (!row) return null;
        return new WaitlistGuest({
            waitlist_id: row.waitlist_id,
            guest_id: row.guest_id,
            priority_level: row.priority_level,
            eta: row.eta,
            notes: row.notes,
            created_at: row.created_at,
            guest_name: row.guest_name,
            guest_category: row.guest_category
        });
    }
}

module.exports = WaitlistGuest;
