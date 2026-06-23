-- PostgreSQL Table Schema for EventHub360 Self-Service Guest Registration Kiosk Module

-- 1. Kiosk Devices Table
CREATE TABLE IF NOT EXISTS kiosk_devices (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,          -- Multi-tenant identifier
    branch_id BIGINT,                    -- Optional branch identifier
    device_name VARCHAR(255) NOT NULL,   -- e.g. 'Main Gate Kiosk A'
    device_code VARCHAR(100) NOT NULL,   -- Unique identifier code e.g. 'KSK-01'
    location VARCHAR(255),               -- e.g. 'Grand Ballroom Foyer'
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Offline', 'Maintenance', 'Assistance Required')),
    last_seen TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (company_id, device_code)
);

-- 2. Kiosk Sessions Table
CREATE TABLE IF NOT EXISTS kiosk_sessions (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    kiosk_device_id BIGINT NOT NULL REFERENCES kiosk_devices(id) ON DELETE CASCADE,
    guest_id BIGINT,                     -- References external guest table, nullable if session starts before registration
    session_start TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Abandoned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Business Card Scans Table
CREATE TABLE IF NOT EXISTS business_card_scans (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    guest_id BIGINT,                     -- References external guest table, nullable before registration
    image_url TEXT NOT NULL,             -- Image location URL
    ocr_data JSONB NOT NULL DEFAULT '{}',-- Parsed OCR data mapping (name, email, company, job_title, phone)
    processing_status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (processing_status IN ('Pending', 'Completed', 'Failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Guest Photos Table
CREATE TABLE IF NOT EXISTS guest_photos (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    guest_id BIGINT NOT NULL,            -- References external guest table
    photo_url TEXT NOT NULL,             -- Photo location URL
    capture_source VARCHAR(100) NOT NULL DEFAULT 'Kiosk Camera' CHECK (capture_source IN ('Kiosk Camera', 'Upload')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Registration Audit Logs Table
CREATE TABLE IF NOT EXISTS registration_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    guest_id BIGINT,                     -- References external guest table, nullable for device-only actions
    action VARCHAR(255) NOT NULL,        -- e.g. 'Session Started', 'Card Scanned', 'Registered', 'Assistance Request'
    performed_by VARCHAR(255),           -- 'Kiosk' or KioskDevice.id or operator user id
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Kiosk Languages Table
CREATE TABLE IF NOT EXISTS kiosk_languages (
    id BIGSERIAL PRIMARY KEY,
    language_code VARCHAR(10) NOT NULL,   -- e.g. 'en', 'es', 'fr', 'de'
    language_name VARCHAR(100) NOT NULL,  -- e.g. 'English', 'Spanish', 'French'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (language_code)
);

-- 7. Registration Queue Table
CREATE TABLE IF NOT EXISTS registration_queues (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    guest_id BIGINT NOT NULL,            -- References external guest table
    queue_status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (queue_status IN ('Pending', 'Approved', 'Printed', 'Failed')),
    priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_kiosk_devices_lookup ON kiosk_devices(company_id, status);
CREATE INDEX IF NOT EXISTS idx_kiosk_sessions_device ON kiosk_sessions(kiosk_device_id, status);
CREATE INDEX IF NOT EXISTS idx_business_card_scans_guest ON business_card_scans(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_photos_guest ON guest_photos(guest_id);
CREATE INDEX IF NOT EXISTS idx_reg_audit_logs_guest ON registration_audit_logs(company_id, guest_id);
CREATE INDEX IF NOT EXISTS idx_reg_queues_lookup ON registration_queues(company_id, queue_status);
