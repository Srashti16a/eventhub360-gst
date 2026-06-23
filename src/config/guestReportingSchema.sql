-- PostgreSQL Table Schema for EventHub360 Guest Analytics & Reporting Module

-- 0. RSVP table context creation (if missing)
CREATE TABLE IF NOT EXISTS rsvp (
    rsvp_id BIGSERIAL PRIMARY KEY,
    event_guest_id BIGINT UNIQUE NOT NULL, -- References external event_guest table
    status VARCHAR(50) NOT NULL CHECK (status IN ('yes', 'Accepted', 'no', 'Declined', 'maybe', 'Pending')),
    responded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 1. Report Templates Table
CREATE TABLE IF NOT EXISTS report_templates (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,          -- Multi-tenant identifier
    name VARCHAR(255) NOT NULL,          -- e.g. 'VIP Weekly Summary'
    description TEXT,
    group_by_column VARCHAR(100),       -- e.g. 'category', 'meal_preference'
    filter_criteria JSONB NOT NULL DEFAULT '{}', -- Joi filters
    sort_criteria JSONB NOT NULL DEFAULT '{}',   -- Joi sorting
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Report Columns Table
CREATE TABLE IF NOT EXISTS report_columns (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
    column_name VARCHAR(100) NOT NULL,  -- e.g. 'guest_name', 'email', 'rsvp_status'
    display_label VARCHAR(100) NOT NULL,
    column_order INTEGER NOT NULL DEFAULT 0
);

-- 3. Guest Reports Table
CREATE TABLE IF NOT EXISTS guest_reports (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,          -- Multi-tenant identifier
    event_id BIGINT NOT NULL,            -- References external events table
    name VARCHAR(255) NOT NULL,          -- e.g. 'Catering Breakdown Report'
    description TEXT,
    template_id BIGINT REFERENCES report_templates(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Guest Data Snapshots Table (Frozen audit snapshots log)
CREATE TABLE IF NOT EXISTS guest_data_snapshots (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL REFERENCES guest_reports(id) ON DELETE CASCADE,
    guest_id BIGINT NOT NULL,            -- References external guest table
    snapshot_data JSONB NOT NULL DEFAULT '{}', -- Frozen details
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Report Export Histories Table
CREATE TABLE IF NOT EXISTS report_export_histories (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    report_id BIGINT REFERENCES guest_reports(id) ON DELETE SET NULL,
    export_type VARCHAR(50) NOT NULL CHECK (export_type IN ('PDF', 'Excel')),
    file_url TEXT NOT NULL,
    performed_by BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Guest Category Analytics Table (Performance aggregated statistics cache)
CREATE TABLE IF NOT EXISTS guest_category_analytics (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,        -- 'VIP', 'Speaker', 'Standard'
    total_count INTEGER DEFAULT 0,
    confirmed_count INTEGER DEFAULT 0,
    checked_in_count INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (event_id, category)
);

-- 7. Attendance Trends Table (Velocity counters)
CREATE TABLE IF NOT EXISTS attendance_trends (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    time_bucket VARCHAR(50) NOT NULL,    -- e.g. 'Daily: Mon', 'Daily: Tue', 'Weekly'
    checkin_count INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (event_id, time_bucket)
);

-- 8. Satisfaction Analytics Table
CREATE TABLE IF NOT EXISTS satisfaction_analytics (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    average_score NUMERIC(3, 2) NOT NULL DEFAULT 0.00, -- average feedback rating
    total_responses INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (event_id)
);

-- Performance indices
CREATE INDEX IF NOT EXISTS idx_guest_reports_event ON guest_reports(company_id, event_id);
CREATE INDEX IF NOT EXISTS idx_report_templates ON report_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_report_columns_temp ON report_columns(template_id);
CREATE INDEX IF NOT EXISTS idx_guest_data_snapshots ON guest_data_snapshots(report_id, guest_id);
CREATE INDEX IF NOT EXISTS idx_report_export_hist ON report_export_histories(company_id, report_id);
CREATE INDEX IF NOT EXISTS idx_guest_cat_anal ON guest_category_analytics(company_id, event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_trends ON attendance_trends(company_id, event_id);
CREATE INDEX IF NOT EXISTS idx_satisfaction_anal ON satisfaction_analytics(company_id, event_id);
