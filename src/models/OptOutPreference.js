/**
 * OptOutPreference Entity Model
 */
class OptOutPreference {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number} params.guest_id
     * @param {'Email' | 'WhatsApp' | 'SMS' | 'All'} params.channel
     * @param {boolean} [params.opt_out]
     * @param {Date|string} [params.updated_at]
     * 
     * // Joined parameters
     * @param {string} [params.guest_name]
     * @param {string} [params.guest_email]
     */
    constructor({
        id,
        company_id,
        guest_id,
        channel,
        opt_out = true,
        updated_at,
        guest_name = null,
        guest_email = null
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.guest_id = Number(guest_id);
        this.channel = channel;
        this.opt_out = !!opt_out;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;

        // Joined properties
        this.guest_name = guest_name;
        this.guest_email = guest_email;
    }

    /**
     * Map database row directly to OptOutPreference Entity instance
     * @param {Object} row 
     * @returns {OptOutPreference}
     */
    static fromRow(row) {
        if (!row) return null;
        return new OptOutPreference({
            id: row.id,
            company_id: row.company_id,
            guest_id: row.guest_id,
            channel: row.channel,
            opt_out: row.opt_out,
            updated_at: row.updated_at,
            guest_name: row.guest_name,
            guest_email: row.guest_email
        });
    }
}

module.exports = OptOutPreference;
