-- PostgreSQL Table Schema for Room Allocation Matrix Module

-- 1. Floors Table
CREATE TABLE IF NOT EXISTS floors (
    floor_id BIGSERIAL PRIMARY KEY,
    hotel_id BIGINT NOT NULL,          -- Scopes floors under a specific hotel
    floor_name VARCHAR(100) NOT NULL,  -- e.g. 'Floor 5', 'Floor 4'
    floor_number INTEGER NOT NULL CHECK (floor_number >= 0),
    total_rooms INTEGER NOT NULL DEFAULT 0 CHECK (total_rooms >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Link the existing rooms table to the floors table if not already linked
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS floor_id BIGINT REFERENCES floors(floor_id) ON DELETE SET NULL;

-- 2. Room Allocations Table
CREATE TABLE IF NOT EXISTS room_allocations (
    allocation_id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL,           -- Link to target room
    guest_id BIGINT NOT NULL,          -- Link to target guest
    reservation_id BIGINT,             -- Link to reservation context
    allocation_status VARCHAR(50) NOT NULL DEFAULT 'Assigned' CHECK (allocation_status IN ('Assigned', 'Reserved', 'Checked In', 'Checked Out')),
    assigned_by BIGINT NOT NULL,       -- Admin/concierge user ID performing the allocation
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Room Conflicts Table
CREATE TABLE IF NOT EXISTS room_conflicts (
    conflict_id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL,           -- Conflict room reference
    guest_id BIGINT NOT NULL,          -- Conflict guest reference
    conflict_type VARCHAR(100) NOT NULL CHECK (conflict_type IN ('Double Booking', 'Overlapping Stay', 'Invalid Assignment')),
    conflict_message TEXT NOT NULL,    -- Human readable warnings shown in UI (e.g. 'Double Booking Detected')
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Guest Requests Table
CREATE TABLE IF NOT EXISTS guest_requests (
    request_id BIGSERIAL PRIMARY KEY,
    guest_id BIGINT NOT NULL,          -- Target guest
    request_type VARCHAR(100) NOT NULL CHECK (request_type IN ('High Floor', 'VIP Placement', 'King Bed', 'Suite Upgrade', 'Other')),
    request_value TEXT,                -- Details (e.g. 'King bed preferred', 'Upgrade to Royal Suite')
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Auto Assignment Logs Table
CREATE TABLE IF NOT EXISTS auto_assignment_logs (
    log_id BIGSERIAL PRIMARY KEY,
    guest_id BIGINT NOT NULL,
    room_id BIGINT REFERENCES rooms(room_id) ON DELETE CASCADE,
    assignment_rule TEXT NOT NULL,     -- Describes allocation rules matching categories to floors
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance optimization & quick dashboard aggregates
CREATE INDEX IF NOT EXISTS idx_floors_hotel ON floors(hotel_id);
CREATE INDEX IF NOT EXISTS idx_room_allocations_room ON room_allocations(room_id);
CREATE INDEX IF NOT EXISTS idx_room_allocations_guest ON room_allocations(guest_id);
CREATE INDEX IF NOT EXISTS idx_room_conflicts_unresolved ON room_conflicts(resolved) WHERE resolved = FALSE;
CREATE INDEX IF NOT EXISTS idx_guest_requests_guest ON guest_requests(guest_id);
