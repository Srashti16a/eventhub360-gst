/**
 * CampaignRecipient Entity Model
 */
class CampaignRecipient {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.campaign_id
     * @param {number} params.guest_id
     * @param {'Pending' | 'Sent' | 'Delivered' | 'Failed' | 'Opened' | 'Clicked'} [params.delivery_status]
     * @param {string|null} [params.error_message]
     * @param {Date|string|null} [params.sent_at]
     * @param {Date|string|null} [params.opened_at]
     * @param {Date|string|null} [params.clicked_at]
     * 
     * // Joined parameters
     * @param {string} [params.guest_name]
     * @param {string} [params.guest_email]
     * @param {string} [params.guest_phone]
     */
    constructor({
        id,
        campaign_id,
        guest_id,
        delivery_status = 'Pending',
        error_message = null,
        sent_at = null,
        opened_at = null,
        clicked_at = null,
        guest_name = null,
        guest_email = null,
        guest_phone = null
    }) {
        this.id = id ? Number(id) : undefined;
        this.campaign_id = Number(campaign_id);
        this.guest_id = Number(guest_id);
        this.delivery_status = delivery_status;
        this.error_message = error_message;
        this.sent_at = sent_at ? new Date(sent_at) : null;
        this.opened_at = opened_at ? new Date(opened_at) : null;
        this.clicked_at = clicked_at ? new Date(clicked_at) : null;

        // Joined properties
        this.guest_name = guest_name;
        this.guest_email = guest_email;
        this.guest_phone = guest_phone;
    }

    /**
     * Map database row directly to CampaignRecipient Entity instance
     * @param {Object} row 
     * @returns {CampaignRecipient}
     */
    static fromRow(row) {
        if (!row) return null;
        return new CampaignRecipient({
            id: row.id,
            campaign_id: row.campaign_id,
            guest_id: row.guest_id,
            delivery_status: row.delivery_status,
            error_message: row.error_message,
            sent_at: row.sent_at,
            opened_at: row.opened_at,
            clicked_at: row.clicked_at,
            guest_name: row.guest_name,
            guest_email: row.guest_email,
            guest_phone: row.guest_phone
        });
    }
}

module.exports = CampaignRecipient;
