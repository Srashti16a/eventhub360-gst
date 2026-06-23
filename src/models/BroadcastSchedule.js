/**
 * BroadcastSchedule Entity Model
 */
class BroadcastSchedule {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.campaign_id
     * @param {Date|string} params.scheduled_time
     * @param {'Pending' | 'Executed' | 'Cancelled'} [params.status]
     * @param {Date|string} [params.created_at]
     * 
     * // Joined parameters
     * @param {string} [params.campaign_name]
     * @param {'Email' | 'WhatsApp' | 'SMS'} [params.channel]
     */
    constructor({
        id,
        campaign_id,
        scheduled_time,
        status = 'Pending',
        created_at,
        campaign_name = null,
        channel = null
    }) {
        this.id = id ? Number(id) : undefined;
        this.campaign_id = Number(campaign_id);
        this.scheduled_time = new Date(scheduled_time);
        this.status = status;
        this.created_at = created_at ? new Date(created_at) : undefined;

        // Joined properties
        this.campaign_name = campaign_name;
        this.channel = channel;
    }

    /**
     * Map database row directly to BroadcastSchedule Entity instance
     * @param {Object} row 
     * @returns {BroadcastSchedule}
     */
    static fromRow(row) {
        if (!row) return null;
        return new BroadcastSchedule({
            id: row.id,
            campaign_id: row.campaign_id,
            scheduled_time: row.scheduled_time,
            status: row.status,
            created_at: row.created_at,
            campaign_name: row.campaign_name,
            channel: row.channel
        });
    }
}

module.exports = BroadcastSchedule;
