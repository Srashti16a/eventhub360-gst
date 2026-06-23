-- PostgreSQL Table Schema for EventHub360 Transportation & Fleet Management Module

-- 0. Adjust existing drivers status check constraints
ALTER TABLE drivers DROP CONSTRAINT IF EXISTS drivers_status_check;
ALTER TABLE drivers ADD CONSTRAINT drivers_status_check CHECK (status IN ('Available', 'Active', 'Off Duty', 'Resting', 'On Break', 'On-Break', 'Offline'));

-- 1. Fleet Assignments Table
CREATE TABLE IF NOT EXISTS fleet_assignments (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    branch_id BIGINT,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    driver_id BIGINT NOT NULL REFERENCES drivers(driver_id) ON DELETE CASCADE,
    event_id BIGINT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Cancelled')),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(event_id, vehicle_id, driver_id)
);

-- 2. Transport Routes Table
CREATE TABLE IF NOT EXISTS transport_routes (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    branch_id BIGINT,
    route_name VARCHAR(255) NOT NULL,
    start_location VARCHAR(255) NOT NULL,
    end_location VARCHAR(255) NOT NULL,
    distance_km NUMERIC(6, 2) NOT NULL CHECK (distance_km >= 0.00),
    duration_mins INTEGER NOT NULL CHECK (duration_mins >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    optimized_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Arrivals & Departures Transfers Table
CREATE TABLE IF NOT EXISTS arrival_departure_schedules (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    branch_id BIGINT,
    guest_id BIGINT NOT NULL REFERENCES guest(guest_id) ON DELETE CASCADE,
    event_id BIGINT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    transfer_type VARCHAR(100) NOT NULL CHECK (transfer_type IN ('Airport Pickup', 'Airport Dropoff', 'Hotel Transfer', 'VIP Transport', 'Other')),
    pickup_location VARCHAR(255) NOT NULL,
    dropoff_location VARCHAR(255) NOT NULL,
    scheduled_time TIMESTAMPTZ NOT NULL,
    route_id BIGINT REFERENCES transport_routes(id) ON DELETE SET NULL,
    vehicle_id BIGINT REFERENCES vehicles(vehicle_id) ON DELETE SET NULL,
    driver_id BIGINT REFERENCES drivers(driver_id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Transit', 'Completed', 'Cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Fleet Activity Logs Table
CREATE TABLE IF NOT EXISTS fleet_activity_logs (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    branch_id BIGINT,
    activity_type VARCHAR(100) NOT NULL CHECK (activity_type IN ('Route Completed', 'Dispatch Alert', 'Maintenance Alert', 'Assignment Update', 'Driver Status Change', 'Conflict Detected')),
    severity VARCHAR(50) NOT NULL DEFAULT 'Info' CHECK (severity IN ('Info', 'Warning', 'Critical')),
    message TEXT NOT NULL,
    vehicle_id BIGINT REFERENCES vehicles(vehicle_id) ON DELETE SET NULL,
    driver_id BIGINT REFERENCES drivers(driver_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Vehicle Maintenances Table
CREATE TABLE IF NOT EXISTS vehicle_maintenances (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    branch_id BIGINT,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    maintenance_type VARCHAR(100) NOT NULL CHECK (maintenance_type IN ('Oil Change', 'Tire Rotation', 'Engine Repair', 'Fuel Warning', 'Routine Inspection', 'Other')),
    description TEXT,
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
    cost NUMERIC(10, 2) DEFAULT 0.00 CHECK (cost >= 0.00),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Fleet Analytics Cache Table
CREATE TABLE IF NOT EXISTS fleet_analytics (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    branch_id BIGINT,
    event_id BIGINT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    total_vehicles INTEGER NOT NULL DEFAULT 0 CHECK (total_vehicles >= 0),
    active_drivers INTEGER NOT NULL DEFAULT 0 CHECK (active_drivers >= 0),
    on_route_vehicles INTEGER NOT NULL DEFAULT 0 CHECK (on_route_vehicles >= 0),
    efficiency_rating NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (efficiency_rating >= 0.00 AND efficiency_rating <= 100.00),
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (event_id, recorded_date)
);

-- Performance indices
CREATE INDEX IF NOT EXISTS idx_fleet_assignments ON fleet_assignments(company_id, event_id);
CREATE INDEX IF NOT EXISTS idx_transport_routes ON transport_routes(company_id);
CREATE INDEX IF NOT EXISTS idx_arrival_departure_sch ON arrival_departure_schedules(company_id, event_id);
CREATE INDEX IF NOT EXISTS idx_fleet_activity_logs ON fleet_activity_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenances ON vehicle_maintenances(company_id, vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fleet_analytics ON fleet_analytics(company_id, event_id);
