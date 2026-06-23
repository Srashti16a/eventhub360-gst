/**
 * BadgeTemplate Entity Model
 */
class BadgeTemplate {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number|null} [params.branch_id]
     * @param {number} params.event_id
     * @param {string} params.template_name
     * @param {'Portrait' | 'Landscape'} [params.orientation]
     * @param {'4x6' | '3x4' | 'Standard'} [params.card_size]
     * @param {boolean} [params.include_qr]
     * @param {boolean} [params.include_logo]
     * @param {boolean} [params.show_job_title]
     * @param {boolean} [params.center_alignment]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     */
    constructor({
        id,
        company_id,
        branch_id = null,
        event_id,
        template_name,
        orientation = 'Portrait',
        card_size = '4x6',
        include_qr = true,
        include_logo = true,
        show_job_title = false,
        center_alignment = true,
        created_at,
        updated_at
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.event_id = Number(event_id);
        this.template_name = template_name;
        this.orientation = orientation;
        this.card_size = card_size;
        this.include_qr = !!include_qr;
        this.include_logo = !!include_logo;
        this.show_job_title = !!show_job_title;
        this.center_alignment = !!center_alignment;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
    }

    /**
     * Map database row directly to BadgeTemplate Entity instance
     * @param {Object} row 
     * @returns {BadgeTemplate}
     */
    static fromRow(row) {
        if (!row) return null;
        return new BadgeTemplate({
            id: row.id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            event_id: row.event_id,
            template_name: row.template_name,
            orientation: row.orientation,
            card_size: row.card_size,
            include_qr: row.include_qr,
            include_logo: row.include_logo,
            show_job_title: row.show_job_title,
            center_alignment: row.center_alignment,
            created_at: row.created_at,
            updated_at: row.updated_at
        });
    }
}

module.exports = BadgeTemplate;
