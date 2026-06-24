-- PostgreSQL Table Schema for Meal Preferences & Dietary Management Module

-- 1. Meal Preferences Table
CREATE TABLE IF NOT EXISTS meal_pref (
    meal_pref_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,          -- Multi-tenant identifier
    branch_id BIGINT,                    -- Optional branch identifier
    guest_id BIGINT NOT NULL,            -- Link to external guest table
    dietary_type VARCHAR(100) NOT NULL DEFAULT 'Non-Vegetarian' CHECK (dietary_type IN ('Vegan', 'Vegetarian', 'Non-Vegetarian', 'Gluten-Free', 'Keto', 'Custom')),
    custom_dietary_notes TEXT,
    special_requests TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,                   -- User ID audit tracker
    updated_by BIGINT,                   -- User ID audit tracker
    
    UNIQUE (company_id, guest_id)
);

-- 2. Guest Allergies Table (Supports detailed multiple allergies tracking)
CREATE TABLE IF NOT EXISTS guest_allergies (
    guest_allergy_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,          -- Multi-tenant identifier
    guest_id BIGINT NOT NULL,            -- Link to external guest table
    allergen_name VARCHAR(100) NOT NULL CHECK (allergen_name IN ('Nuts', 'Shellfish', 'Dairy', 'Soy', 'Egg', 'Gluten', 'Other')),
    severity VARCHAR(50) NOT NULL DEFAULT 'Mild' CHECK (severity IN ('Mild', 'Moderate', 'Severe')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (company_id, guest_id, allergen_name)
);

-- 3. Menu Items Table (For catering menu planning & daily specials)
CREATE TABLE IF NOT EXISTS menu_items (
    menu_item_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,          -- Multi-tenant identifier
    branch_id BIGINT,                    -- Optional branch identifier
    event_id BIGINT,                     -- Optional reference to target event
    name VARCHAR(255) NOT NULL,
    description TEXT,
    dietary_category VARCHAR(100) NOT NULL CHECK (dietary_category IN ('Vegan', 'Vegetarian', 'Non-Vegetarian', 'Gluten-Free', 'Keto', 'Custom')),
    allergens VARCHAR(100)[] DEFAULT '{}', -- Array of allergens present in this dish
    is_daily_special BOOLEAN NOT NULL DEFAULT FALSE,
    price NUMERIC(10, 2) DEFAULT 0.00 CHECK (price >= 0.00),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);

-- 4. Chef Prep Schedules Table (Chef summaries, inventory alerts, and schedules)
CREATE TABLE IF NOT EXISTS chef_prep_schedules (
    schedule_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,          -- Multi-tenant identifier
    branch_id BIGINT,                    -- Optional branch identifier
    event_id BIGINT NOT NULL,            -- Link to external event table
    menu_item_id BIGINT NOT NULL REFERENCES menu_items(menu_item_id) ON DELETE CASCADE,
    prep_start_time VARCHAR(50) NOT NULL DEFAULT '06:00 AM', -- Time of day e.g. '06:00 AM'
    special_request_count INTEGER NOT NULL DEFAULT 0 CHECK (special_request_count >= 0),
    inventory_status VARCHAR(50) NOT NULL DEFAULT 'Adequate' CHECK (inventory_status IN ('Adequate', 'Low', 'Critical')),
    stock_alert_item VARCHAR(255),       -- Specific ingredient warning e.g. 'Chicken Breast'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);

-- 5. Meal Recommendations Table (AI-generated smart suggestions)
CREATE TABLE IF NOT EXISTS meal_recommendations (
    suggestion_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,          -- Multi-tenant identifier
    branch_id BIGINT,                    -- Optional branch identifier
    event_id BIGINT NOT NULL,            -- Link to external event table
    recommendation_type VARCHAR(100) NOT NULL CHECK (recommendation_type IN ('Dietary Trend', 'Menu Optimization', 'Allergy Risk Warning', 'Smart Catering')),
    message TEXT NOT NULL,
    recommendation_metadata JSONB DEFAULT '{}', -- Details such as target percentages or specific ingredient changes
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Applied', 'Dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    applied_at TIMESTAMPTZ,
    applied_by BIGINT
);

-- Indices for fast retrieval and dashboard stats aggregation
CREATE INDEX IF NOT EXISTS idx_meal_pref_lookup ON meal_pref(company_id, guest_id);
CREATE INDEX IF NOT EXISTS idx_meal_pref_type ON meal_pref(dietary_type);
CREATE INDEX IF NOT EXISTS idx_guest_allergies_lookup ON guest_allergies(company_id, guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_allergies_name ON guest_allergies(allergen_name);
CREATE INDEX IF NOT EXISTS idx_menu_items_event ON menu_items(company_id, event_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(dietary_category);
CREATE INDEX IF NOT EXISTS idx_chef_prep_schedules_event ON chef_prep_schedules(company_id, event_id);
CREATE INDEX IF NOT EXISTS idx_chef_prep_schedules_lookup ON chef_prep_schedules(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_meal_recommendations_lookup ON meal_recommendations(company_id, event_id, status) WHERE status = 'Active';
