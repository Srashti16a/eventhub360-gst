/**
 * CommunicationLog Entity Model
 */
class CommunicationLog {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number|null} [params.campaign_id]
     * @param {number} params.guest_id
     * @param {'Email' | 'WhatsApp' | 'SMS'} params.channel
     * @param {string} params.recipient_address
     * @param {'Sent' | 'Delivered' | 'Failed'} [params.status]
     * @param {Date|string} [params.sent_at]
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
        status = 'Sent',
        sent_at,
        campaign_name = null,
        guest_name = null
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.campaign_id = campaign_id ? Number(campaign_id) : null;
        this.guest_id = Number(guest_id);
        this.channel = channel;
        this.recipient_address = recipient_address;
        this.status = status;
        this.sent_at = sent_at ? new Date(sent_at) : undefined;

        // Joined properties
        this.campaign_name = campaign_name;
        this.guest_name = guest_name;
    }

    /**
     * Map database row directly to CommunicationLog Entity instance
     * @param {Object} row 
     * @returns {CommunicationLog}
     */
    static fromRow(row) {
        if (!row) return null;
        return new CommunicationLog({
            id: row.id,
            company_id: row.company_id,
            campaign_id: row.campaign_id,
            guest_id: row.guest_id,
            channel: row.channel,
            recipient_address: row.recipient_address,
            status: row.status,
            sent_at: row.sent_at,
            campaign_name: row.campaign_name,
            guest_name: row.guest_name
        });
    }
}

module.exports = CommunicationLog;
