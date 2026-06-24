/**
 * Magic Link Data Transfer Objects (DTOs)
 */

class MagicLinkCreateDTO {
    /**
     * @param {Object} data
     * @param {number} data.guest_id
     * @param {'24 Hours' | '7 Days' | '30 Days' | 'No Expiration'} [data.expiration_type]
     * @param {boolean} [data.single_use]
     * @param {boolean} [data.ip_lockdown]
     * @param {string} [data.allowed_ip]
     */
    constructor(data) {
        this.guest_id = Number(data.guest_id);
        this.expiration_type = data.expiration_type || '7 Days';
        this.single_use = data.single_use !== undefined ? Boolean(data.single_use) : false;
        this.ip_lockdown = data.ip_lockdown !== undefined ? Boolean(data.ip_lockdown) : false;
        this.allowed_ip = data.allowed_ip || null;
    }
}

class MagicLinkBulkCreateDTO {
    /**
     * @param {Object} data
     * @param {number[]} data.guest_ids
     * @param {'24 Hours' | '7 Days' | '30 Days' | 'No Expiration'} [data.expiration_type]
     * @param {boolean} [data.single_use]
     * @param {boolean} [data.ip_lockdown]
     * @param {string} [data.allowed_ip]
     */
    constructor(data) {
        this.guest_ids = Array.isArray(data.guest_ids) ? data.guest_ids.map(Number) : [];
        this.expiration_type = data.expiration_type || '7 Days';
        this.single_use = data.single_use !== undefined ? Boolean(data.single_use) : false;
        this.ip_lockdown = data.ip_lockdown !== undefined ? Boolean(data.ip_lockdown) : false;
        this.allowed_ip = data.allowed_ip || null;
    }
}

class MagicLinkResponseDTO {
    /**
     * Map MagicLink entity to detailed response
     * @param {import('./MagicLink')} ml
     * @param {string} [baseUrl] - Base URL to prefix tokens
     */
    constructor(ml, baseUrl = 'https://eventhub360.com/rsvp/ml') {
        this.magic_link_id = ml.magic_link_id;
        this.guest_id = ml.guest_id;
        this.guest_name = ml.guest_name || 'Unknown Guest';
        this.guest_category = ml.guest_category || 'General';
        this.guest_phone = ml.guest_phone || null;
        this.token = ml.token;
        this.link_url = `${baseUrl}/${ml.token}`;
        this.expires_at = ml.expires_at ? ml.expires_at.toISOString() : null;
        this.single_use = ml.single_use;
        this.ip_lockdown = ml.ip_lockdown;
        this.allowed_ip = ml.allowed_ip;
        this.locked_ip = ml.locked_ip;
        this.use_count = ml.use_count;
        this.max_uses = ml.max_uses;
        this.is_revoked = ml.is_revoked;
        this.status = ml.status;
        this.qr_code_preview = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(this.link_url)}`;
        this.created_at = ml.created_at ? ml.created_at.toISOString() : null;
        this.updated_at = ml.updated_at ? ml.updated_at.toISOString() : null;
    }
}

class MagicLinkListResponseDTO {
    /**
     * Map MagicLink entity to a compact list item format
     * @param {import('./MagicLink')} ml
     * @param {string} [baseUrl] - Base URL to prefix tokens
     */
    constructor(ml, baseUrl = 'https://eventhub360.com/rsvp/ml') {
        this.magic_link_id = ml.magic_link_id;
        this.guest_id = ml.guest_id;
        this.guest_name = ml.guest_name || 'Unknown Guest';
        this.guest_category = ml.guest_category || 'General';
        this.link_url = `${baseUrl}/${ml.token}`;
        this.created_at = ml.created_at ? ml.created_at.toISOString() : null;
        this.expires_at = ml.expires_at ? ml.expires_at.toISOString() : null;
        this.status = ml.status;
        this.use_count = ml.use_count;
    }
}

class MagicLinkStatsDTO {
    /**
     * @param {Object} stats
     * @param {number} stats.total_active
     * @param {number} stats.expiring_soon
     * @param {number} stats.total_uses
     */
    constructor(stats) {
        this.totalActiveLinks = Number(stats.total_active || 0);
        this.expiringSoon = Number(stats.expiring_soon || 0);
        this.totalUses = Number(stats.total_uses || 0);
        
        // Match percentage changes and UI captions from screenshots
        this.metricsTrends = {
            totalActiveLinksChange: "+12%",
            expiringSoonChange: "Critical Attention Required",
            totalUsesLabel: "Lifetime"
        };
    }
}

module.exports = {
    MagicLinkCreateDTO,
    MagicLinkBulkCreateDTO,
    MagicLinkResponseDTO,
    MagicLinkListResponseDTO,
    MagicLinkStatsDTO
};
