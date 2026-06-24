-- PostgreSQL Table Schema for Seating / Table Layout Designer Module

-- 1. Table Layouts (Versioning container for layouts)
CREATE TABLE IF NOT EXISTS table_layouts (
    layout_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,          -- Multi-tenant identifier
    branch_id BIGINT,                    -- Optional branch identifier
    event_id BIGINT NOT NULL,            -- References external event table
    name VARCHAR(255) NOT NULL,          -- e.g. 'Winter Gala 2024 Layout'
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Saved', 'Finalized')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);

-- 2. Seating Zones (Zoning tables in physical areas e.g., 'Zone A', 'VIP Section')
CREATE TABLE IF NOT EXISTS seating_zones (
    zone_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    branch_id BIGINT,
    layout_id BIGINT NOT NULL REFERENCES table_layouts(layout_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,          -- e.g. 'Zone A', 'Stage VIP'
    color_code VARCHAR(7) NOT NULL DEFAULT '#E2E8F0', -- Hex representation for UI color
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Event Tables (Representing physical tables placed on canvas)
CREATE TABLE IF NOT EXISTS event_tables (
    table_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    branch_id BIGINT,
    layout_id BIGINT NOT NULL REFERENCES table_layouts(layout_id) ON DELETE CASCADE,
    zone_id BIGINT REFERENCES seating_zones(zone_id) ON DELETE SET NULL,
    table_number VARCHAR(50) NOT NULL,   -- Custom display e.g. '01', 'T-10'
    shape VARCHAR(50) NOT NULL DEFAULT 'Round' CHECK (shape IN ('Round', 'Square', 'Rectangle', 'Long')),
    capacity INTEGER NOT NULL DEFAULT 8 CHECK (capacity > 0),
    is_vip BOOLEAN NOT NULL DEFAULT FALSE,
    -- Positioning coords and dimensions for Drag-and-Drop functionality
    x_coordinate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    y_coordinate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    rotation NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (rotation >= 0.00 AND rotation < 360.00),
    width NUMERIC(8, 2) DEFAULT NULL,    -- Dimension metrics if custom
    height NUMERIC(8, 2) DEFAULT NULL,   -- Dimension metrics if custom
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (layout_id, table_number)
);

-- 4. Seats (Scoping individual seats relative to each table)
CREATE TABLE IF NOT EXISTS seats (
    seat_id BIGSERIAL PRIMARY KEY,
    table_id BIGINT NOT NULL REFERENCES event_tables(table_id) ON DELETE CASCADE,
    seat_number INTEGER NOT NULL CHECK (seat_number > 0),
    -- Coordinates offset from table center
    offset_x NUMERIC(10, 2) DEFAULT 0.00,
    offset_y NUMERIC(10, 2) DEFAULT 0.00,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (table_id, seat_number)
);

-- 5. Table Assignments (Guest seat mappings)
CREATE TABLE IF NOT EXISTS table_assignments (
    assignment_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    layout_id BIGINT NOT NULL REFERENCES table_layouts(layout_id) ON DELETE CASCADE,
    table_id BIGINT NOT NULL REFERENCES event_tables(table_id) ON DELETE CASCADE,
    seat_id BIGINT REFERENCES seats(seat_id) ON DELETE SET NULL,
    guest_id BIGINT NOT NULL,            -- References external guest table
    assigned_by BIGINT NOT NULL,         -- User ID of operator
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (layout_id, guest_id),        -- A guest can only be seated once in a layout
    UNIQUE (layout_id, table_id, seat_id) -- A seat cannot have duplicate assignments in a layout
);

-- 6. Layout Rules (Configurations defining spacing/clearance constraints)
CREATE TABLE IF NOT EXISTS layout_rules (
    rule_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,            -- Scoped event rules
    rule_name VARCHAR(255) NOT NULL,     -- e.g. 'VIP Distance Rule'
    rule_type VARCHAR(100) NOT NULL CHECK (rule_type IN ('Spacing Clearance', 'Max Capacity', 'VIP Exclusivity')),
    rule_configuration JSONB NOT NULL DEFAULT '{}', -- details e.g. { "min_meters": 2.0 }
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Layout Validation Logs (Violations recorded by the Rule Checker engine)
CREATE TABLE IF NOT EXISTS layout_validation_logs (
    log_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    layout_id BIGINT NOT NULL REFERENCES table_layouts(layout_id) ON DELETE CASCADE,
    rule_id BIGINT REFERENCES layout_rules(rule_id) ON DELETE SET NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'Warning' CHECK (severity IN ('Info', 'Warning', 'Critical')),
    message TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}', -- Specific invalid coordinates or entity IDs
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance and multi-tenant constraints
CREATE INDEX IF NOT EXISTS idx_table_layouts_event ON table_layouts(company_id, event_id);
CREATE INDEX IF NOT EXISTS idx_seating_zones_layout ON seating_zones(layout_id);
CREATE INDEX IF NOT EXISTS idx_event_tables_layout ON event_tables(layout_id);
CREATE INDEX IF NOT EXISTS idx_event_tables_zone ON event_tables(zone_id);
CREATE INDEX IF NOT EXISTS idx_seats_table ON seats(table_id);
CREATE INDEX IF NOT EXISTS idx_table_assignments_lookup ON table_assignments(layout_id, table_id, guest_id);
CREATE INDEX IF NOT EXISTS idx_layout_rules_event ON layout_rules(company_id, event_id);
CREATE INDEX IF NOT EXISTS idx_layout_val_logs_unresolved ON layout_validation_logs(layout_id) WHERE resolved = FALSE;
