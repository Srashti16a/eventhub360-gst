/**
 * CommunicationLog DTO Layer
 */

class MessageDeliveryLogResponseDTO {
    constructor(log) {
        if (!log) return;
        this.id = log.id;
        this.company_id = log.company_id;
        this.campaign_id = log.campaign_id;
        this.guest_id = log.guest_id;
        this.channel = log.channel;
        this.recipient_address = log.recipient_address;
        this.status = log.status;
        this.delivery_result = log.delivery_result;
        this.sent_at = log.sent_at ? log.sent_at.toISOString() : null;
        this.delivered_at = log.delivered_at ? log.delivered_at.toISOString() : null;
        this.read_at = log.read_at ? log.read_at.toISOString() : null;
        this.created_at = log.created_at ? log.created_at.toISOString() : null;

        // Joined properties
        this.guest_name = log.guest_name || null;
        this.campaign_name = log.campaign_name || null;

        // Nested detailed structures (if resolved)
        this.failures = [];
        this.retries = [];
        this.latency = null;
    }
}

class GatewayFailureResponseDTO {
    constructor(f) {
        if (!f) return;
        this.id = f.id;
        this.log_id = f.log_id;
        this.gateway_name = f.gateway_name;
        this.error_code = f.error_code;
        this.error_message = f.error_message;
        this.failure_time = f.failure_time ? f.failure_time.toISOString() : null;
    }
}

class RetryHistoryResponseDTO {
    constructor(r) {
        if (!r) return;
        this.id = r.id;
        this.log_id = r.log_id;
        this.retry_count = r.retry_count;
        this.retry_time = r.retry_time ? r.retry_time.toISOString() : null;
        this.status = r.status;
        this.gateway_response = r.gateway_response;
    }
}

class TrafficRerouteResponseDTO {
    constructor(rr) {
        if (!rr) return;
        this.id = rr.id;
        this.company_id = rr.company_id;
        this.channel = rr.channel;
        this.from_gateway = rr.from_gateway;
        this.to_gateway = rr.to_gateway;
        this.reroute_reason = rr.reroute_reason;
        this.rerouted_at = rr.rerouted_at ? rr.rerouted_at.toISOString() : null;
        this.is_active = rr.is_active;
    }
}

class CommunicationLatencyResponseDTO {
    constructor(l) {
        if (!l) return;
        this.id = l.id;
        this.log_id = l.log_id;
        this.channel = l.channel;
        this.queue_latency_ms = l.queue_latency_ms;
        this.delivery_latency_ms = l.delivery_latency_ms;
        this.total_latency_ms = l.total_latency_ms;
        this.created_at = l.created_at ? l.created_at.toISOString() : null;
    }
}

class AutomationAlertResponseDTO {
    constructor(a) {
        if (!a) return;
        this.id = a.id;
        this.company_id = a.company_id;
        this.alert_type = a.alert_type;
        this.severity = a.severity;
        this.message = a.message;
        this.status = a.status;
        this.created_at = a.created_at ? a.created_at.toISOString() : null;
        this.updated_at = a.updated_at ? a.updated_at.toISOString() : null;
    }
}

class DashboardStatsResponseDTO {
    constructor({ total_logs, successful_deliveries_pct, active_failures, avg_latency_sec }) {
        this.total_logs = total_logs || 0;
        this.successful_deliveries_pct = successful_deliveries_pct !== undefined ? Number(successful_deliveries_pct) : 0.0;
        this.active_failures = active_failures || 0;
        this.avg_latency_sec = avg_latency_sec !== undefined ? Number(avg_latency_sec) : 0.0;
    }
}

module.exports = {
    MessageDeliveryLogResponseDTO,
    GatewayFailureResponseDTO,
    RetryHistoryResponseDTO,
    TrafficRerouteResponseDTO,
    CommunicationLatencyResponseDTO,
    AutomationAlertResponseDTO,
    DashboardStatsResponseDTO
};
