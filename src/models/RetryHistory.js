/**
 * RetryHistory Entity Model
 */
class RetryHistory {
    constructor({
        id,
        company_id,
        log_id,
        retry_count,
        retry_time,
        status,
        gateway_response = null
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.log_id = Number(log_id);
        this.retry_count = Number(retry_count);
        this.retry_time = retry_time ? new Date(retry_time) : undefined;
        this.status = status;
        this.gateway_response = gateway_response;
    }

    static fromRow(row) {
        if (!row) return null;
        return new RetryHistory({
            id: row.id,
            company_id: row.company_id,
            log_id: row.log_id,
            retry_count: row.retry_count,
            retry_time: row.retry_time,
            status: row.status,
            gateway_response: row.gateway_response
        });
    }
}

module.exports = RetryHistory;
