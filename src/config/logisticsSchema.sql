-- PostgreSQL Table Schema for Logistics Matrix Module

-- 1. Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
    driver_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,          -- Multi-tenant identifier
    branch_id BIGINT,                    -- Optional branch identifier
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Active', 'Off Duty')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,          -- Multi-tenant identifier
    branch_id BIGINT,                    -- Optional branch identifier
    vehicle_name VARCHAR(255) NOT NULL,
    vehicle_type VARCHAR(100) NOT NULL, -- e.g. 'Sedan', 'SUV', 'Van', 'Minibus'
    license_number VARCHAR(50) UNIQUE NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'Available' CHECK (status IN ('On Route', 'Staged', 'Maintenance', 'Available')),
    driver_id BIGINT REFERENCES drivers(driver_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Guest Transport Allocations Table
CREATE TABLE IF NOT EXISTS guest_transport_allocations (
    allocation_id BIGSERIAL PRIMARY KEY,
    guest_id BIGINT NOT NULL,            -- References external guest table
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    assigned_by BIGINT NOT NULL,         -- Admin/user who allocated
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    allocation_status VARCHAR(50) NOT NULL DEFAULT 'Assigned' CHECK (allocation_status IN ('Assigned', 'Reserved', 'Checked In', 'Checked Out'))
);

-- 4. Transport Conflicts Table
CREATE TABLE IF NOT EXISTS transport_conflicts (
    conflict_id BIGSERIAL PRIMARY KEY,
    allocation_id BIGINT REFERENCES guest_transport_allocations(allocation_id) ON DELETE CASCADE,
    conflict_type VARCHAR(100) NOT NULL CHECK (conflict_type IN ('Capacity Conflict', 'Timing Conflict', 'Route Conflict')),
    conflict_message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Unresolved' CHECK (status IN ('Unresolved', 'Resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Waitlist Guests Table
CREATE TABLE IF NOT EXISTS waitlist_guests (
    waitlist_id BIGSERIAL PRIMARY KEY,
    guest_id BIGINT NOT NULL,            -- References external guest table
    priority_level VARCHAR(50) NOT NULL CHECK (priority_level IN ('Critical', 'High', 'Standard', 'Low')),
    eta TIMESTAMPTZ NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Route Optimization Logs Table
CREATE TABLE IF NOT EXISTS route_optimization_logs (
    log_id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    optimization_result JSONB NOT NULL,  -- JSON payload describing coordinates/waypoints optimized path
    generated_by BIGINT NOT NULL,        -- Admin/user id triggering optimization
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indices for query performance and multi-tenant scoping
CREATE INDEX IF NOT EXISTS idx_drivers_company ON drivers(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_company ON vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_trans_alloc_guest ON guest_transport_allocations(guest_id);
CREATE INDEX IF NOT EXISTS idx_trans_alloc_vehicle ON guest_transport_allocations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trans_conflicts_unresolved ON transport_conflicts(status) WHERE status = 'Unresolved';
CREATE INDEX IF NOT EXISTS idx_waitlist_guest ON waitlist_guests(guest_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_priority ON waitlist_guests(priority_level);
