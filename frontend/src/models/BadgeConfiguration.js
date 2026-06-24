/**
 * BadgeConfiguration Entity Model
 */
class BadgeConfiguration {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number} params.event_id
     * @param {number|null} [params.default_template_id]
     * @param {boolean} [params.auto_generate_qr]
     * @param {boolean} [params.auto_print_on_checkin]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     */
    constructor({
        id,
        company_id,
        event_id,
        default_template_id = null,
        auto_generate_qr = true,
        auto_print_on_checkin = false,
        created_at,
        updated_at
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.event_id = Number(event_id);
        this.default_template_id = default_template_id ? Number(default_template_id) : null;
        this.auto_generate_qr = !!auto_generate_qr;
        this.auto_print_on_checkin = !!auto_print_on_checkin;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
    }

    /**
     * Map database row directly to BadgeConfiguration Entity instance
     * @param {Object} row 
     * @returns {BadgeConfiguration}
     */
    static fromRow(row) {
        if (!row) return null;
        return new BadgeConfiguration({
            id: row.id,
            company_id: row.company_id,
            event_id: row.event_id,
            default_template_id: row.default_template_id,
            auto_generate_qr: row.auto_generate_qr,
            auto_print_on_checkin: row.auto_print_on_checkin,
            created_at: row.created_at,
            updated_at: row.updated_at
        });
    }
}

module.exports = BadgeConfiguration;
