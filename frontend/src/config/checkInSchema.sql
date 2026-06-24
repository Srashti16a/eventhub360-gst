-- PostgreSQL Table Schema for Check-In & QR Scanner Operations Module

-- 1. Entry Gates Table
CREATE TABLE IF NOT EXISTS entry_gates (
    entry_gate_id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL,            -- References external event table
    gate_name VARCHAR(100) NOT NULL,     -- e.g. 'North Gate', 'VIP Entrance'
    gate_type VARCHAR(50) NOT NULL CHECK (gate_type IN ('Main Entrance', 'VIP Gate', 'Staff Entrance', 'Ballroom Entrance')),
    capacity_limit INTEGER NOT NULL DEFAULT 500 CHECK (capacity_limit > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'Clear Flow' CHECK (status IN ('Clear Flow', 'Queuing', 'Slow Lane', 'Fast Lane', 'Closed'))
);

-- 2. Check-In Records Table
CREATE TABLE IF NOT EXISTS checkin_records (
    checkin_record_id BIGSERIAL PRIMARY KEY,
    guest_id BIGINT NOT NULL,            -- References external guest table
    event_id BIGINT NOT NULL,            -- References external event table
    pass_id BIGINT REFERENCES qr_passes(pass_id) ON DELETE SET NULL, -- Null if manual check-in
    scanner_device_id BIGINT REFERENCES scanner_devices(device_id) ON DELETE SET NULL,
    entry_gate_id BIGINT REFERENCES entry_gates(entry_gate_id) ON DELETE SET NULL,
    checkin_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    checkin_method VARCHAR(50) NOT NULL CHECK (checkin_method IN ('QR Scan', 'Manual')),
    status VARCHAR(50) NOT NULL DEFAULT 'Success' CHECK (status IN ('Success', 'Flagged', 'Failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (event_id, guest_id)          -- A guest can check-in only once per event
);

-- 3. Attendance Tracker Table (Live statistics aggregation)
CREATE TABLE IF NOT EXISTS attendance_trackers (
    tracker_id BIGSERIAL PRIMARY KEY,
    event_id BIGINT UNIQUE NOT NULL,      -- References external event table
    expected_guests INTEGER NOT NULL DEFAULT 0 CHECK (expected_guests >= 0),
    checked_in_guests INTEGER NOT NULL DEFAULT 0 CHECK (checked_in_guests >= 0 AND checked_in_guests <= expected_guests),
    vip_checked_in INTEGER NOT NULL DEFAULT 0 CHECK (vip_checked_in >= 0),
    occupancy_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (occupancy_percentage >= 0.00 AND occupancy_percentage <= 100.00),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. VIP Arrival Alerts Table (Admin alert feed)
CREATE TABLE IF NOT EXISTS vip_arrival_alerts (
    alert_id BIGSERIAL PRIMARY KEY,
    guest_id BIGINT NOT NULL,            -- References external VIP guest
    event_id BIGINT NOT NULL,            -- References external event table
    arrival_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    alert_status VARCHAR(50) NOT NULL DEFAULT 'Unread' CHECK (alert_status IN ('Unread', 'Read', 'Dismissed'))
);

-- 5. Check-In Staff Table (Gate assignments & shifts)
CREATE TABLE IF NOT EXISTS checkin_staff (
    staff_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,             -- References admin/staff user
    event_id BIGINT NOT NULL,
    entry_gate_id BIGINT REFERENCES entry_gates(entry_gate_id) ON DELETE CASCADE,
    shift_start TIMESTAMPTZ NOT NULL,
    shift_end TIMESTAMPTZ NOT NULL CHECK (shift_end >= shift_start)
);

-- 6. Check-In History Table (Auditing operations logs)
CREATE TABLE IF NOT EXISTS checkin_histories (
    history_id BIGSERIAL PRIMARY KEY,
    guest_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    action VARCHAR(255) NOT NULL,        -- e.g. 'Manual Override', 'Flagged Guest Review', 'Pass Reset'
    performed_by BIGINT NOT NULL,        -- Admin User ID executing the action
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Flow Analytics Table (Hourly velocity tracking for peak check-in management)
CREATE TABLE IF NOT EXISTS flow_analytics (
    analytics_id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL,
    time_slot TIMESTAMPTZ NOT NULL,      -- Mapped hourly slot e.g. '2026-06-22 19:00:00'
    guest_count INTEGER NOT NULL DEFAULT 0 CHECK (guest_count >= 0),
    flow_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (flow_rate >= 0.00), -- guests processed per minute
    peak_indicator BOOLEAN NOT NULL DEFAULT FALSE,
    
    UNIQUE (event_id, time_slot)
);

-- 8. Guest Flags Table (For security flags & blacklisted review workflows)
CREATE TABLE IF NOT EXISTS guest_flags (
    flag_id BIGSERIAL PRIMARY KEY,
    guest_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    flag_reason TEXT NOT NULL,
    flag_status VARCHAR(50) NOT NULL DEFAULT 'Flagged' CHECK (flag_status IN ('Flagged', 'Reviewed', 'Resolved')),
    reviewed_by BIGINT,                  -- Admin User ID executing review
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (event_id, guest_id)
);

-- Indices for registry query speed and dashboard analytics performance
CREATE INDEX IF NOT EXISTS idx_checkin_records_event ON checkin_records(event_id);
CREATE INDEX IF NOT EXISTS idx_checkin_records_guest ON checkin_records(guest_id);
CREATE INDEX IF NOT EXISTS idx_attendance_trackers_event ON attendance_trackers(event_id);
CREATE INDEX IF NOT EXISTS idx_vip_arrival_alerts_unread ON vip_arrival_alerts(alert_status) WHERE alert_status = 'Unread';
CREATE INDEX IF NOT EXISTS idx_checkin_staff_lookup ON checkin_staff(event_id, entry_gate_id);
CREATE INDEX IF NOT EXISTS idx_flow_analytics_slot ON flow_analytics(event_id, time_slot);
CREATE INDEX IF NOT EXISTS idx_guest_flags_unresolved ON guest_flags(event_id, flag_status) WHERE flag_status = 'Flagged';
