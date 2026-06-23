/**
 * NotificationQueue Entity Model
 */
class NotificationQueue {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number|null} [params.campaign_id]
     * @param {number} params.guest_id
     * @param {'Email' | 'WhatsApp' | 'SMS'} params.channel
     * @param {string} params.recipient_address
     * @param {string|null} [params.subject]
     * @param {string} params.body
     * @param {'Pending' | 'Processing' | 'Completed' | 'Failed'} [params.status]
     * @param {number} [params.priority]
     * @param {Date|string} [params.created_at]
     * 
     * // Joined parameters
     * @param {string} [params.campaign_name]
     * @param {string} [params.guest_name]
     */
    constructor({
        id,
        company_id,
        campaign_id = null,
        guest_id,
        channel,
        recipient_address,
        subject = null,
        body,
        status = 'Pending',
        priority = 1,
        created_at,
        campaign_name = null,
        guest_name = null
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.campaign_id = campaign_id ? Number(campaign_id) : null;
        this.guest_id = Number(guest_id);
        this.channel = channel;
        this.recipient_address = recipient_address;
        this.subject = subject;
        this.body = body;
        this.status = status;
        this.priority = Number(priority);
        this.created_at = created_at ? new Date(created_at) : undefined;

        // Joined properties
        this.campaign_name = campaign_name;
        this.guest_name = guest_name;
    }

    /**
     * Map database row directly to NotificationQueue Entity instance
     * @param {Object} row 
     * @returns {NotificationQueue}
     */
    static fromRow(row) {
        if (!row) return null;
        return new NotificationQueue({
            id: row.id,
            company_id: row.company_id,
            campaign_id: row.campaign_id,
            guest_id: row.guest_id,
            channel: row.channel,
            recipient_address: row.recipient_address,
            subject: row.subject,
            body: row.body,
            status: row.status,
            priority: row.priority,
            created_at: row.created_at,
            campaign_name: row.campaign_name,
            guest_name: row.guest_name
        });
    }
}

module.exports = NotificationQueue;
