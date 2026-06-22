-- PostgreSQL Schema for EventHub360 Guest Management Module
-- Note: Assuming 'company' and 'event' tables exist in the target database.

-- 1. Guest Table
CREATE TABLE IF NOT EXISTS guest (
    guest_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(20),
    category VARCHAR(20), -- VIP, Family, Corporate
    
    -- Tenant-scoped implicit columns
    tenant_id BIGINT,
    branch_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. Guest Group Table
CREATE TABLE IF NOT EXISTS guest_group (
    group_id BIGSERIAL PRIMARY KEY,
    event_id BIGINT,
    name VARCHAR(60) NOT NULL,
    
    -- Tenant-scoped implicit columns
    tenant_id BIGINT,
    company_id BIGINT,
    branch_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Event Guest (Junction Table for event N:M guest)
CREATE TABLE IF NOT EXISTS event_guest (
    event_guest_id BIGSERIAL PRIMARY KEY,
    event_id BIGINT,
    guest_id BIGINT REFERENCES guest(guest_id) ON DELETE CASCADE,
    group_id BIGINT REFERENCES guest_group(group_id) ON DELETE SET NULL,
    invited BOOLEAN DEFAULT FALSE,
    rsvp_token VARCHAR(100) UNIQUE NOT NULL,
    
    -- Tenant-scoped implicit columns
    tenant_id BIGINT,
    company_id BIGINT,
    branch_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. RSVP Table (event_guest 1:1 rsvp)
CREATE TABLE IF NOT EXISTS rsvp (
    rsvp_id BIGSERIAL PRIMARY KEY,
    event_guest_id BIGINT UNIQUE REFERENCES event_guest(event_guest_id) ON DELETE CASCADE,
    status VARCHAR(12) NOT NULL CHECK (status IN ('yes', 'no', 'maybe')),
    pax INT DEFAULT 1,
    responded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Tenant-scoped implicit columns
    tenant_id BIGINT,
    company_id BIGINT,
    branch_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 5. Seating Table (event_guest 1:N seating)
CREATE TABLE IF NOT EXISTS seating (
    seating_id BIGSERIAL PRIMARY KEY,
    event_guest_id BIGINT REFERENCES event_guest(event_guest_id) ON DELETE CASCADE,
    table_no VARCHAR(10) NOT NULL,
    seat_no VARCHAR(10) NOT NULL,
    
    -- Tenant-scoped implicit columns
    tenant_id BIGINT,
    company_id BIGINT,
    branch_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 6. Meal Preference Table (event_guest 1:N meal_pref)
CREATE TABLE IF NOT EXISTS meal_pref (
    meal_pref_id BIGSERIAL PRIMARY KEY,
    event_guest_id BIGINT REFERENCES event_guest(event_guest_id) ON DELETE CASCADE,
    preference VARCHAR(40) NOT NULL, -- Veg/Non-veg/Jain/Allergy
    
    -- Tenant-scoped implicit columns
    tenant_id BIGINT,
    company_id BIGINT,
    branch_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 7. Guest Check-in Table (event_guest 1:N guest_checkin)
CREATE TABLE IF NOT EXISTS guest_checkin (
    checkin_id BIGSERIAL PRIMARY KEY,
    event_guest_id BIGINT REFERENCES event_guest(event_guest_id) ON DELETE CASCADE,
    checked_in_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    qr_code VARCHAR(64) NOT NULL,
    
    -- Tenant-scoped implicit columns
    tenant_id BIGINT,
    company_id BIGINT,
    branch_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_guest_company_id ON guest(company_id);
CREATE INDEX IF NOT EXISTS idx_guest_group_event_id ON guest_group(event_id);
CREATE INDEX IF NOT EXISTS idx_event_guest_event_id ON event_guest(event_id);
CREATE INDEX IF NOT EXISTS idx_event_guest_guest_id ON event_guest(guest_id);
CREATE INDEX IF NOT EXISTS idx_event_guest_rsvp_token ON event_guest(rsvp_token);
CREATE INDEX IF NOT EXISTS idx_rsvp_event_guest_id ON rsvp(event_guest_id);
CREATE INDEX IF NOT EXISTS idx_seating_event_guest_id ON seating(event_guest_id);
CREATE INDEX IF NOT EXISTS idx_meal_pref_event_guest_id ON meal_pref(event_guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_checkin_event_guest_id ON guest_checkin(event_guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_checkin_qr_code ON guest_checkin(qr_code);
