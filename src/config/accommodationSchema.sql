-- PostgreSQL Table Schema for Accommodation Dashboard Module

-- 1. Hotels Table
CREATE TABLE IF NOT EXISTS hotels (
    hotel_id BIGSERIAL PRIMARY KEY,
    hotel_name VARCHAR(255) NOT NULL,
    hotel_type VARCHAR(100) NOT NULL, -- e.g. 'Resort', 'Business', 'Boutique'
    address TEXT NOT NULL,
    total_rooms INTEGER NOT NULL DEFAULT 0 CHECK (total_rooms >= 0),
    available_rooms INTEGER NOT NULL DEFAULT 0 CHECK (available_rooms >= 0 AND available_rooms <= total_rooms),
    occupancy_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (occupancy_percentage >= 0.00 AND occupancy_percentage <= 100.00),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    room_id BIGSERIAL PRIMARY KEY,
    hotel_id BIGINT NOT NULL REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    room_number VARCHAR(50) NOT NULL,
    room_type VARCHAR(100) NOT NULL, -- e.g. 'Royal Suite', 'Penthouse', 'Deluxe', 'Double'
    room_status VARCHAR(50) NOT NULL DEFAULT 'Available' CHECK (room_status IN ('Available', 'Reserved', 'Occupied', 'Maintenance')),
    capacity INTEGER NOT NULL DEFAULT 1 CHECK (capacity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (hotel_id, room_number)
);

-- 3. Accommodation Reservations Table
CREATE TABLE IF NOT EXISTS accommodation_reservations (
    reservation_id BIGSERIAL PRIMARY KEY,
    guest_id BIGINT NOT NULL, -- References external guest table
    hotel_id BIGINT NOT NULL REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    room_id BIGINT REFERENCES rooms(room_id) ON DELETE SET NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL CHECK (check_out_date >= check_in_date),
    reservation_status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (reservation_status IN ('Pending', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. VIP Allocations Table
CREATE TABLE IF NOT EXISTS vip_allocations (
    allocation_id BIGSERIAL PRIMARY KEY,
    guest_id BIGINT NOT NULL, -- References external VIP guest table
    hotel_id BIGINT NOT NULL REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    room_id BIGINT REFERENCES rooms(room_id) ON DELETE SET NULL,
    allocation_status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (allocation_status IN ('Assigned', 'Pending')),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Accommodation Reports Table
CREATE TABLE IF NOT EXISTS accommodation_reports (
    report_id BIGSERIAL PRIMARY KEY,
    report_type VARCHAR(100) NOT NULL, -- e.g. 'Utilization', 'VIP Allocations', 'Occupancy'
    generated_by BIGINT NOT NULL,      -- User ID of the administrator
    generated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    file_url TEXT NOT NULL
);

-- Indices for performance optimization & quick dashboard aggregate querying
CREATE INDEX IF NOT EXISTS idx_hotels_occupancy ON hotels(occupancy_percentage);
CREATE INDEX IF NOT EXISTS idx_rooms_hotel ON rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(room_status);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON accommodation_reservations(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON accommodation_reservations(reservation_status);
CREATE INDEX IF NOT EXISTS idx_reservations_guest ON accommodation_reservations(guest_id);
CREATE INDEX IF NOT EXISTS idx_vip_allocations_guest ON vip_allocations(guest_id);
CREATE INDEX IF NOT EXISTS idx_vip_allocations_lookup ON vip_allocations(hotel_id, allocation_status);
