-- PostgreSQL Table Schema for QR Pass Center Module

-- 1. QR Passes Table
CREATE TABLE IF NOT EXISTS qr_passes (
    pass_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,          -- Multi-tenant identifier
    branch_id BIGINT,                    -- Optional branch identifier
    guest_id BIGINT NOT NULL,            -- Reference to external guest table
    pass_code VARCHAR(100) NOT NULL,     -- Unique printable code e.g. 'EH-VIP-2901'
    pass_type VARCHAR(50) NOT NULL CHECK (pass_type IN ('VIP', 'Attendee', 'Staff', 'Media', 'Vendor')),
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Scanned', 'Revoked', 'Expired')),
    qr_code_url TEXT,                    -- Location where generated image is hosted (S3/local CDN)
    security_hash VARCHAR(64) NOT NULL,  -- SHA-256 validation hash signature
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,                   -- Operator user ID context
    updated_by BIGINT,                   -- Operator user ID context
    
    UNIQUE (company_id, pass_code),
    UNIQUE (company_id, guest_id)        -- A guest is allocated exactly one pass code context
);

-- 2. QR Pass Deliveries (Logs channels and statuses of sent passes)
CREATE TABLE IF NOT EXISTS qr_pass_deliveries (
    delivery_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    pass_id BIGINT NOT NULL REFERENCES qr_passes(pass_id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('Email', 'WhatsApp')),
    recipient_address VARCHAR(255) NOT NULL, -- Destination phone number or email address
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Sent', 'Delivered', 'Failed')),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Scanner Devices Table (Device authorization registry)
CREATE TABLE IF NOT EXISTS scanner_devices (
    device_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    device_name VARCHAR(255) NOT NULL,   -- e.g. 'Main Hall Gate Scanner'
    device_type VARCHAR(50) NOT NULL DEFAULT 'Handheld' CHECK (device_type IN ('Handheld', 'Automatic', 'Kiosk')),
    access_token VARCHAR(255) UNIQUE NOT NULL, -- SHA cryptographic token to authorize API accesses
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Offline')),
    last_active TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Pass Scan Logs (Scans tracking and analytics)
CREATE TABLE IF NOT EXISTS pass_scan_logs (
    scan_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    pass_id BIGINT NOT NULL REFERENCES qr_passes(pass_id) ON DELETE CASCADE,
    device_id BIGINT REFERENCES scanner_devices(device_id) ON DELETE SET NULL,
    scan_location VARCHAR(255) NOT NULL, -- e.g. 'Grand Ballroom Entrance'
    scanned_by VARCHAR(255),             -- Operator name if handheld scanner (e.g. 'Agent Smith')
    scan_status VARCHAR(50) NOT NULL CHECK (scan_status IN ('Valid', 'Duplicate', 'Invalid', 'Revoked', 'Expired')),
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Pass Security Audits (Logs verification checks and detects tamper alerts)
CREATE TABLE IF NOT EXISTS pass_security_audits (
    audit_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    pass_id BIGINT NOT NULL REFERENCES qr_passes(pass_id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL CHECK (action_type IN ('Validation Check', 'Hash Regenerated', 'Tamper Detected', 'Token Signature Verification')),
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    hash_verified BOOLEAN NOT NULL DEFAULT TRUE,
    details JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Batch Pass Generations (Tracks background execution details of bulk pass creation jobs)
CREATE TABLE IF NOT EXISTS batch_pass_generations (
    batch_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,            -- References external event contexts
    pass_type VARCHAR(50) NOT NULL,      -- Mapped pass types
    total_passes INTEGER NOT NULL CHECK (total_passes > 0),
    generated_count INTEGER NOT NULL DEFAULT 0 CHECK (generated_count >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'Processing' CHECK (status IN ('Processing', 'Completed', 'Failed')),
    error_log TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- 7. Pass Revocation Logs
CREATE TABLE IF NOT EXISTS pass_revocation_logs (
    revocation_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    pass_id BIGINT NOT NULL REFERENCES qr_passes(pass_id) ON DELETE CASCADE,
    revoked_by BIGINT NOT NULL,          -- User ID context of administrator
    revocation_reason TEXT NOT NULL,
    revoked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indices for registry listing speed, scanner stats tracking, and multi-tenant scoping
CREATE INDEX IF NOT EXISTS idx_qr_passes_lookup ON qr_passes(company_id, guest_id);
CREATE INDEX IF NOT EXISTS idx_qr_passes_code ON qr_passes(company_id, pass_code);
CREATE INDEX IF NOT EXISTS idx_qr_passes_status ON qr_passes(status);
CREATE INDEX IF NOT EXISTS idx_qr_pass_deliv_pass ON qr_pass_deliveries(pass_id);
CREATE INDEX IF NOT EXISTS idx_pass_scan_logs_pass ON pass_scan_logs(pass_id);
CREATE INDEX IF NOT EXISTS idx_pass_scan_logs_location ON pass_scan_logs(scan_location);
CREATE INDEX IF NOT EXISTS idx_pass_sec_audits_pass ON pass_security_audits(pass_id);
CREATE INDEX IF NOT EXISTS idx_batch_pass_gen ON batch_pass_generations(company_id, event_id);
