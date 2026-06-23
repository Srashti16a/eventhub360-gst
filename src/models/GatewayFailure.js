/**
 * GatewayFailure Entity Model
 */
class GatewayFailure {
    constructor({
        id,
        company_id,
        log_id,
        gateway_name,
        error_code = null,
        error_message = null,
        failure_time
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.log_id = Number(log_id);
        this.gateway_name = gateway_name;
        this.error_code = error_code;
        this.error_message = error_message;
        this.failure_time = failure_time ? new Date(failure_time) : undefined;
    }

    static fromRow(row) {
        if (!row) return null;
        return new GatewayFailure({
            id: row.id,
            company_id: row.company_id,
            log_id: row.log_id,
            gateway_name: row.gateway_name,
            error_code: row.error_code,
            error_message: row.error_message,
            failure_time: row.failure_time
        });
    }
}

module.exports = GatewayFailure;
