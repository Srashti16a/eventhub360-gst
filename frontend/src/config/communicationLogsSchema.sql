-- PostgreSQL Table Schema for EventHub360 Communication Monitoring & Logs Module

-- 1. Message Delivery Logs Table
CREATE TABLE IF NOT EXISTS message_delivery_logs (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,          -- Multi-tenant identifier
    campaign_id BIGINT REFERENCES campaigns(id) ON DELETE SET NULL,
    guest_id BIGINT NOT NULL REFERENCES guest(guest_id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('Email', 'WhatsApp', 'SMS')),
    recipient_address VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Sent', 'Delivered', 'Failed', 'Read')),
    delivery_result VARCHAR(255),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Gateway Failures Table
CREATE TABLE IF NOT EXISTS gateway_failures (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    log_id BIGINT REFERENCES message_delivery_logs(id) ON DELETE CASCADE,
    gateway_name VARCHAR(100) NOT NULL,  -- e.g. 'SendGrid', 'Twilio'
    error_code VARCHAR(50),
    error_message TEXT,
    failure_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Retry History Table
CREATE TABLE IF NOT EXISTS retry_histories (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    log_id BIGINT REFERENCES message_delivery_logs(id) ON DELETE CASCADE,
    retry_count INTEGER NOT NULL DEFAULT 1,
    retry_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Retrying', 'Success', 'Failed')),
    gateway_response TEXT
);

-- 4. Traffic Reroutes Table (Dynamic routing logs)
CREATE TABLE IF NOT EXISTS traffic_reroutes (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('Email', 'WhatsApp', 'SMS')),
    from_gateway VARCHAR(100) NOT NULL,
    to_gateway VARCHAR(100) NOT NULL,
    reroute_reason TEXT,
    rerouted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 5. Communication Latencies Table
CREATE TABLE IF NOT EXISTS communication_latencies (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    log_id BIGINT REFERENCES message_delivery_logs(id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('Email', 'WhatsApp', 'SMS')),
    queue_latency_ms BIGINT DEFAULT 0,
    delivery_latency_ms BIGINT DEFAULT 0,
    total_latency_ms BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Automation Alerts Table
CREATE TABLE IF NOT EXISTS automation_alerts (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    alert_type VARCHAR(100) NOT NULL,    -- e.g. 'High Failure Rate'
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('Warning', 'Critical')),
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Resolved', 'Dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Performance indices
CREATE INDEX IF NOT EXISTS idx_delivery_logs_lookup ON message_delivery_logs(company_id, status);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_guest ON message_delivery_logs(guest_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_campaign ON message_delivery_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_created ON message_delivery_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_gateway_failures_log ON gateway_failures(log_id);
CREATE INDEX IF NOT EXISTS idx_retry_histories_log ON retry_histories(log_id);
CREATE INDEX IF NOT EXISTS idx_traffic_reroutes_active ON traffic_reroutes(company_id, channel, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_comm_latencies_created ON communication_latencies(created_at);
CREATE INDEX IF NOT EXISTS idx_automation_alerts_status ON automation_alerts(company_id, status);
