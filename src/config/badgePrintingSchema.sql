-- PostgreSQL Table Schema for EventHub360 Badge Printing Command Center Module

-- 1. Badge Printers Table
CREATE TABLE IF NOT EXISTS badge_printers (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,          -- Multi-tenant identifier
    branch_id BIGINT,                    -- Optional branch identifier
    printer_name VARCHAR(255) NOT NULL,   -- e.g. 'Main Gate ZD621'
    printer_code VARCHAR(100) NOT NULL,   -- Unique identifier code e.g. 'PRN-ZD621-01'
    location VARCHAR(255),               -- e.g. 'Check-in Desk B1'
    status VARCHAR(50) NOT NULL DEFAULT 'Online' CHECK (status IN ('Online', 'Offline', 'Paper Low', 'Maintenance')),
    paper_status VARCHAR(50) NOT NULL DEFAULT 'OK' CHECK (paper_status IN ('OK', 'Low', 'Empty')),
    last_seen TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (company_id, printer_code)
);

-- 2. Badge Templates Table
CREATE TABLE IF NOT EXISTS badge_templates (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,          -- Multi-tenant identifier
    branch_id BIGINT,
    event_id BIGINT NOT NULL,            -- References external event table
    template_name VARCHAR(255) NOT NULL, -- e.g. 'VIP Badge Style'
    orientation VARCHAR(50) NOT NULL DEFAULT 'Portrait' CHECK (orientation IN ('Portrait', 'Landscape')),
    card_size VARCHAR(50) NOT NULL DEFAULT '4x6' CHECK (card_size IN ('4x6', '3x4', 'Standard')),
    include_qr BOOLEAN NOT NULL DEFAULT TRUE,
    include_logo BOOLEAN NOT NULL DEFAULT TRUE,
    show_job_title BOOLEAN NOT NULL DEFAULT FALSE,
    center_alignment BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Badge Print Jobs Table
CREATE TABLE IF NOT EXISTS badge_print_jobs (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    guest_id BIGINT NOT NULL,            -- References external guest table
    template_id BIGINT REFERENCES badge_templates(id) ON DELETE SET NULL,
    printer_id BIGINT REFERENCES badge_printers(id) ON DELETE SET NULL,
    job_status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (job_status IN ('Pending', 'Printing', 'Completed', 'Failed')),
    priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Print Queue Table
CREATE TABLE IF NOT EXISTS print_queues (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    print_job_id BIGINT NOT NULL REFERENCES badge_print_jobs(id) ON DELETE CASCADE,
    queue_position INTEGER NOT NULL CHECK (queue_position >= 1),
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Failed', 'Completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (company_id, print_job_id)
);

-- 5. Printer Alerts Table
CREATE TABLE IF NOT EXISTS printer_alerts (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    printer_id BIGINT NOT NULL REFERENCES badge_printers(id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL,    -- e.g. 'Paper Out', 'Offline', 'Jam'
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('Info', 'Warning', 'Critical')),
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Resolved', 'Dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Badge Print Logs Table
CREATE TABLE IF NOT EXISTS badge_print_logs (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    print_job_id BIGINT REFERENCES badge_print_jobs(id) ON DELETE SET NULL,
    printer_id BIGINT REFERENCES badge_printers(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,        -- e.g. 'Job Created', 'Test Print', 'Printed successfully', 'Retry'
    performed_by BIGINT,                 -- User ID of operator
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Badge Configurations Table
CREATE TABLE IF NOT EXISTS badge_configurations (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,            -- References external event table
    default_template_id BIGINT REFERENCES badge_templates(id) ON DELETE SET NULL,
    auto_generate_qr BOOLEAN NOT NULL DEFAULT TRUE,
    auto_print_on_checkin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (company_id, event_id)
);

-- 8. Badge Batches Table
CREATE TABLE IF NOT EXISTS badge_batches (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,            -- References external event table
    batch_name VARCHAR(255) NOT NULL,    -- e.g. 'VIP Registrations Morning Batch'
    total_badges INTEGER NOT NULL CHECK (total_badges >= 0),
    generated_count INTEGER NOT NULL DEFAULT 0 CHECK (generated_count >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Completed', 'Failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_badge_printers_lookup ON badge_printers(company_id, status);
CREATE INDEX IF NOT EXISTS idx_badge_templates_event ON badge_templates(company_id, event_id);
CREATE INDEX IF NOT EXISTS idx_badge_print_jobs_lookup ON badge_print_jobs(company_id, job_status);
CREATE INDEX IF NOT EXISTS idx_print_queues_position ON print_queues(company_id, queue_position);
CREATE INDEX IF NOT EXISTS idx_printer_alerts_active ON printer_alerts(company_id, status) WHERE status = 'Active';
CREATE INDEX IF NOT EXISTS idx_badge_print_logs_job ON badge_print_logs(print_job_id);
CREATE INDEX IF NOT EXISTS idx_badge_batches_event ON badge_batches(company_id, event_id);
