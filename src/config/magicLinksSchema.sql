-- PostgreSQL Table Schema for Magic Link Generator Module

CREATE TABLE IF NOT EXISTS magic_links (
    magic_link_id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,          -- Multi-tenant identifier
    branch_id BIGINT,                    -- Optional branch identifier
    guest_id BIGINT NOT NULL,            -- References the guest table
    token VARCHAR(255) UNIQUE NOT NULL,  -- Cryptographically secure unique token embedded in URL
    expires_at TIMESTAMPTZ,              -- Expiration timestamp (NULL maps to "No Expiration")
    single_use BOOLEAN NOT NULL DEFAULT FALSE, -- Flag to enforce single-use access
    ip_lockdown BOOLEAN NOT NULL DEFAULT FALSE, -- Flag to restrict access to a specific or initial IP
    allowed_ip VARCHAR(45),              -- Pre-configured specific IP permitted to access (supports IPv4/IPv6)
    locked_ip VARCHAR(45),               -- Dynamic IP captured on first use if ip_lockdown is enabled
    use_count INTEGER NOT NULL DEFAULT 0, -- Counter tracking how many times the link has been resolved
    max_uses INTEGER DEFAULT NULL,       -- Max allowed usages (typically 1 for single_use)
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE, -- Administrative soft revoke flag
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,                   -- User ID audit tracker
    updated_by BIGINT                    -- User ID audit tracker
);

-- Indexes for performance & quick lookup
CREATE INDEX IF NOT EXISTS idx_magic_links_company_id ON magic_links(company_id);
CREATE INDEX IF NOT EXISTS idx_magic_links_guest_id ON magic_links(guest_id);
CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);
CREATE INDEX IF NOT EXISTS idx_magic_links_expires_at ON magic_links(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_magic_links_status_lookup ON magic_links(is_revoked, expires_at);
