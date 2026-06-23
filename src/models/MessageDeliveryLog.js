/**
 * MessageDeliveryLog Entity Model
 */
class MessageDeliveryLog {
    constructor({
        id,
        company_id,
        campaign_id = null,
        guest_id,
        channel,
        recipient_address,
        status = 'Pending',
        delivery_result = null,
        sent_at = null,
        delivered_at = null,
        read_at = null,
        created_at,
        updated_at,
        // Joined details
        guest_name = null,
        campaign_name = null
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.campaign_id = campaign_id ? Number(campaign_id) : null;
        this.guest_id = Number(guest_id);
        this.channel = channel;
        this.recipient_address = recipient_address;
        this.status = status;
        this.delivery_result = delivery_result;
        this.sent_at = sent_at ? new Date(sent_at) : null;
        this.delivered_at = delivered_at ? new Date(delivered_at) : null;
        this.read_at = read_at ? new Date(read_at) : null;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
        this.guest_name = guest_name;
        this.campaign_name = campaign_name;
    }

    static fromRow(row) {
        if (!row) return null;
        return new MessageDeliveryLog({
            id: row.id,
            company_id: row.company_id,
            campaign_id: row.campaign_id,
            guest_id: row.guest_id,
            channel: row.channel,
            recipient_address: row.recipient_address,
            status: row.status,
            delivery_result: row.delivery_result,
            sent_at: row.sent_at,
            delivered_at: row.delivered_at,
            read_at: row.read_at,
            created_at: row.created_at,
            updated_at: row.updated_at,
            guest_name: row.guest_name,
            campaign_name: row.campaign_name
        });
    }
}

module.exports = MessageDeliveryLog;
