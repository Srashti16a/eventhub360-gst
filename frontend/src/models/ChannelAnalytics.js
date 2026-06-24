/**
 * ChannelAnalytics Entity Model
 */
class ChannelAnalytics {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {'Email' | 'WhatsApp' | 'SMS'} params.channel
     * @param {number} [params.total_sent]
     * @param {number} [params.total_delivered]
     * @param {number} [params.total_opened]
     * @param {number} [params.total_clicked]
     * @param {number} [params.total_failed]
     * @param {Date|string} [params.updated_at]
     */
    constructor({
        id,
        company_id,
        channel,
        total_sent = 0,
        total_delivered = 0,
        total_opened = 0,
        total_clicked = 0,
        total_failed = 0,
        updated_at
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.channel = channel;
        this.total_sent = Number(total_sent);
        this.total_delivered = Number(total_delivered);
        this.total_opened = Number(total_opened);
        this.total_clicked = Number(total_clicked);
        this.total_failed = Number(total_failed);
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
    }

    /**
     * Map database row directly to ChannelAnalytics Entity instance
     * @param {Object} row 
     * @returns {ChannelAnalytics}
     */
    static fromRow(row) {
        if (!row) return null;
        return new ChannelAnalytics({
            id: row.id,
            company_id: row.company_id,
            channel: row.channel,
            total_sent: row.total_sent,
            total_delivered: row.total_delivered,
            total_opened: row.total_opened,
            total_clicked: row.total_clicked,
            total_failed: row.total_failed,
            updated_at: row.updated_at
        });
    }
}

module.exports = ChannelAnalytics;
