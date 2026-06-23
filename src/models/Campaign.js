/**
 * Campaign Entity Model
 */
class Campaign {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number|null} [params.branch_id]
     * @param {number} params.event_id
     * @param {string} params.name
     * @param {'Email' | 'WhatsApp' | 'SMS'} params.channel
     * @param {number|null} [params.template_id]
     * @param {number|null} [params.segment_id]
     * @param {'Draft' | 'Published' | 'Scheduled' | 'Sending' | 'Completed'} [params.status]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     * 
     * // Joined parameters
     * @param {string} [params.event_name]
     * @param {string} [params.template_name]
     * @param {string} [params.segment_name]
     */
    constructor({
        id,
        company_id,
        branch_id = null,
        event_id,
        name,
        channel,
        template_id = null,
        segment_id = null,
        status = 'Draft',
        created_at,
        updated_at,
        event_name = null,
        template_name = null,
        segment_name = null
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.event_id = Number(event_id);
        this.name = name;
        this.channel = channel;
        this.template_id = template_id ? Number(template_id) : null;
        this.segment_id = segment_id ? Number(segment_id) : null;
        this.status = status;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;

        // Joined properties
        this.event_name = event_name;
        this.template_name = template_name;
        this.segment_name = segment_name;
    }

    /**
     * Map database row directly to Campaign Entity instance
     * @param {Object} row 
     * @returns {Campaign}
     */
    static fromRow(row) {
        if (!row) return null;
        return new Campaign({
            id: row.id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            event_id: row.event_id,
            name: row.name,
            channel: row.channel,
            template_id: row.template_id,
            segment_id: row.segment_id,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
            event_name: row.event_name,
            template_name: row.template_name,
            segment_name: row.segment_name
        });
    }
}

module.exports = Campaign;
