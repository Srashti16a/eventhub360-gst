/**
 * QrPassDelivery Entity Model
 */
class QrPassDelivery {
    /**
     * @param {Object} params
     * @param {number} [params.delivery_id]
     * @param {number} params.company_id
     * @param {number} params.pass_id
     * @param {'Email' | 'WhatsApp'} params.channel
     * @param {string} params.recipient_address
     * @param {'Pending' | 'Sent' | 'Delivered' | 'Failed'} [params.status]
     * @param {Date|string} [params.sent_at]
     * @param {Date|string} [params.delivered_at]
     * @param {string} [params.error_message]
     * @param {Date|string} [params.created_at]
     */
    constructor({
        delivery_id,
        company_id,
        pass_id,
        channel,
        recipient_address,
        status = 'Pending',
        sent_at = null,
        delivered_at = null,
        error_message = null,
        created_at
    }) {
        this.delivery_id = delivery_id ? Number(delivery_id) : undefined;
        this.company_id = Number(company_id);
        this.pass_id = Number(pass_id);
        this.channel = channel;
        this.recipient_address = recipient_address;
        this.status = status;
        this.sent_at = sent_at ? new Date(sent_at) : null;
        this.delivered_at = delivered_at ? new Date(delivered_at) : null;
        this.error_message = error_message;
        this.created_at = created_at ? new Date(created_at) : undefined;
    }

    /**
     * Map database row directly to QrPassDelivery Entity instance
     * @param {Object} row 
     * @returns {QrPassDelivery}
     */
    static fromRow(row) {
        if (!row) return null;
        return new QrPassDelivery({
            delivery_id: row.delivery_id,
            company_id: row.company_id,
            pass_id: row.pass_id,
            channel: row.channel,
            recipient_address: row.recipient_address,
            status: row.status,
            sent_at: row.sent_at,
            delivered_at: row.delivered_at,
            error_message: row.error_message,
            created_at: row.created_at
        });
    }
}

module.exports = QrPassDelivery;
