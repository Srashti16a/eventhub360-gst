-- PostgreSQL Table Schema for Templates Module

-- channel: 'EMAIL', 'WHATSAPP'
-- status: 'DRAFT', 'PUBLISHED', 'ARCHIVED'

CREATE TABLE IF NOT EXISTS templates (
    template_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL, -- Multi-tenant identifier
    branch_id BIGINT,           -- Optional branch identifier
    name VARCHAR(255) NOT NULL,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('EMAIL', 'WHATSAPP')),
    category VARCHAR(100) NOT NULL DEFAULT 'Invitation',
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    subject VARCHAR(255),       -- Subject line (primarily for EMAIL channel templates)
    content JSONB NOT NULL DEFAULT '{}', -- Rich structured blocks configuration
    variables JSONB NOT NULL DEFAULT '[]', -- Array of dynamic placeholders used e.g., ["event_date", "guest_name"]
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);

CREATE TABLE IF NOT EXISTS template_versions (
    version_id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES templates(template_id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    subject VARCHAR(255),
    content JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    
    UNIQUE (template_id, version_number)
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_templates_company_id ON templates(company_id);
CREATE INDEX IF NOT EXISTS idx_templates_channel ON templates(channel);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_active ON templates(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_template_versions_template_id ON template_versions(template_id);
