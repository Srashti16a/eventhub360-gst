-- PostgreSQL Table Schema for EventHub360 Communication Center Module

-- 1. Communication Templates Table
CREATE TABLE IF NOT EXISTS communication_templates (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,          -- Multi-tenant identifier
    branch_id BIGINT,                    -- Optional branch identifier
    name VARCHAR(255) NOT NULL,          -- e.g. 'VIP Welcome Email'
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('Email', 'WhatsApp', 'SMS')),
    subject VARCHAR(255),               -- Primarily for Email
    content TEXT NOT NULL,               -- Body text block with placeholders e.g. {{guest_name}}
    variables JSONB NOT NULL DEFAULT '[]', -- Placeholder keys used in text, e.g. ["guest_name", "event_date"]
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Audience Segments Table
CREATE TABLE IF NOT EXISTS audience_segments (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,          -- Multi-tenant identifier
    name VARCHAR(255) NOT NULL,          -- e.g. 'All VIP Guests', 'Checked-in Staff'
    description TEXT,
    rules JSONB NOT NULL DEFAULT '{}',   -- Filtering constraints configuration, e.g. {"category": "VIP"}
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Segment Members Table (Cache table of mapped guest assignments)
CREATE TABLE IF NOT EXISTS segment_members (
    id BIGSERIAL PRIMARY KEY,
    segment_id BIGINT NOT NULL REFERENCES audience_segments(id) ON DELETE CASCADE,
    guest_id BIGINT NOT NULL,            -- References external guest table
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (segment_id, guest_id)
);

-- 4. Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,          -- Multi-tenant identifier
    branch_id BIGINT,
    event_id BIGINT NOT NULL,            -- References external event table
    name VARCHAR(255) NOT NULL,          -- e.g. 'Gala 2024 Initial Invite'
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('Email', 'WhatsApp', 'SMS')),
    template_id BIGINT REFERENCES communication_templates(id) ON DELETE SET NULL,
    segment_id BIGINT REFERENCES audience_segments(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Scheduled', 'Sending', 'Completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Broadcast Schedules Table
CREATE TABLE IF NOT EXISTS broadcast_schedules (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Executed', 'Cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Campaign Recipients Table (Delivery status tracking per campaign dispatch)
CREATE TABLE IF NOT EXISTS campaign_recipients (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    guest_id BIGINT NOT NULL,            -- References external guest table
    delivery_status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (delivery_status IN ('Pending', 'Sent', 'Delivered', 'Failed', 'Opened', 'Clicked')),
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ
);

-- 7. Communication Logs Table (History log for all outgoing messages)
CREATE TABLE IF NOT EXISTS communication_logs (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    campaign_id BIGINT REFERENCES campaigns(id) ON DELETE SET NULL,
    guest_id BIGINT NOT NULL,            -- References external guest table
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('Email', 'WhatsApp', 'SMS')),
    recipient_address VARCHAR(255) NOT NULL, -- Email address or phone number
    status VARCHAR(50) NOT NULL DEFAULT 'Sent' CHECK (status IN ('Sent', 'Delivered', 'Failed')),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Channel Analytics Table (Performance indicators dashboard cache)
CREATE TABLE IF NOT EXISTS channel_analytics (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('Email', 'WhatsApp', 'SMS')),
    total_sent INTEGER NOT NULL DEFAULT 0 CHECK (total_sent >= 0),
    total_delivered INTEGER NOT NULL DEFAULT 0 CHECK (total_delivered >= 0),
    total_opened INTEGER NOT NULL DEFAULT 0 CHECK (total_opened >= 0),
    total_clicked INTEGER NOT NULL DEFAULT 0 CHECK (total_clicked >= 0),
    total_failed INTEGER NOT NULL DEFAULT 0 CHECK (total_failed >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (company_id, channel)
);

-- 9. Notification Queues Table (Buffer queue table)
CREATE TABLE IF NOT EXISTS notification_queues (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    campaign_id BIGINT REFERENCES campaigns(id) ON DELETE SET NULL,
    guest_id BIGINT NOT NULL,            -- References external guest table
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('Email', 'WhatsApp', 'SMS')),
    recipient_address VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    body TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Completed', 'Failed')),
    priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. Opt Out Preferences Table (Opt-outs registry)
CREATE TABLE IF NOT EXISTS opt_out_preferences (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    guest_id BIGINT NOT NULL,            -- References external guest table
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('Email', 'WhatsApp', 'SMS', 'All')),
    opt_out BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (company_id, guest_id, channel)
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_comm_templates_channel ON communication_templates(company_id, channel);
CREATE INDEX IF NOT EXISTS idx_audience_segments_company ON audience_segments(company_id);
CREATE INDEX IF NOT EXISTS idx_segment_members_lookup ON segment_members(segment_id, guest_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_lookup ON campaigns(company_id, status);
CREATE INDEX IF NOT EXISTS idx_broadcast_schedules_time ON broadcast_schedules(scheduled_time, status) WHERE status = 'Pending';
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status ON campaign_recipients(campaign_id, delivery_status);
CREATE INDEX IF NOT EXISTS idx_communication_logs_guest ON communication_logs(company_id, guest_id);
CREATE INDEX IF NOT EXISTS idx_notification_queues_status ON notification_queues(status, priority, created_at) WHERE status = 'Pending';
CREATE INDEX IF NOT EXISTS idx_opt_out_lookup ON opt_out_preferences(company_id, guest_id);
