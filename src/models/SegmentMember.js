/**
 * SegmentMember Entity Model
 */
class SegmentMember {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.segment_id
     * @param {number} params.guest_id
     * @param {Date|string} [params.created_at]
     * 
     * // Joined parameters
     * @param {string} [params.guest_name]
     * @param {string} [params.guest_email]
     * @param {string} [params.guest_phone]
     * @param {string} [params.guest_category]
     */
    constructor({
        id,
        segment_id,
        guest_id,
        created_at,
        guest_name = null,
        guest_email = null,
        guest_phone = null,
        guest_category = null
    }) {
        this.id = id ? Number(id) : undefined;
        this.segment_id = Number(segment_id);
        this.guest_id = Number(guest_id);
        this.created_at = created_at ? new Date(created_at) : undefined;

        // Joined properties
        this.guest_name = guest_name;
        this.guest_email = guest_email;
        this.guest_phone = guest_phone;
        this.guest_category = guest_category;
    }

    /**
     * Map database row directly to SegmentMember Entity instance
     * @param {Object} row 
     * @returns {SegmentMember}
     */
    static fromRow(row) {
        if (!row) return null;
        return new SegmentMember({
            id: row.id,
            segment_id: row.segment_id,
            guest_id: row.guest_id,
            created_at: row.created_at,
            guest_name: row.guest_name,
            guest_email: row.guest_email,
            guest_phone: row.guest_phone,
            guest_category: row.guest_category
        });
    }
}

module.exports = SegmentMember;
