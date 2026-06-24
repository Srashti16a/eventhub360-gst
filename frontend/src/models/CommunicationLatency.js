/**
 * CommunicationLatency Entity Model
 */
class CommunicationLatency {
    constructor({
        id,
        company_id,
        log_id,
        channel,
        queue_latency_ms = 0,
        delivery_latency_ms = 0,
        total_latency_ms = 0,
        created_at
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.log_id = Number(log_id);
        this.channel = channel;
        this.queue_latency_ms = Number(queue_latency_ms);
        this.delivery_latency_ms = Number(delivery_latency_ms);
        this.total_latency_ms = Number(total_latency_ms);
        this.created_at = created_at ? new Date(created_at) : undefined;
    }

    static fromRow(row) {
        if (!row) return null;
        return new CommunicationLatency({
            id: row.id,
            company_id: row.company_id,
            log_id: row.log_id,
            channel: row.channel,
            queue_latency_ms: row.queue_latency_ms,
            delivery_latency_ms: row.delivery_latency_ms,
            total_latency_ms: row.total_latency_ms,
            created_at: row.created_at
        });
    }
}

module.exports = CommunicationLatency;
