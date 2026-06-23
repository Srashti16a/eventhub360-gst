/**
 * MagicLink Entity Model
 */
class MagicLink {
    /**
     * @param {Object} params
     * @param {number} [params.magic_link_id]
     * @param {number} params.company_id
     * @param {number} [params.branch_id]
     * @param {number} params.guest_id
     * @param {string} params.token
     * @param {Date|string} [params.expires_at]
     * @param {boolean} [params.single_use]
     * @param {boolean} [params.ip_lockdown]
     * @param {string} [params.allowed_ip]
     * @param {string} [params.locked_ip]
     * @param {number} [params.use_count]
     * @param {number} [params.max_uses]
     * @param {boolean} [params.is_revoked]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     * @param {number} [params.created_by]
     * @param {number} [params.updated_by]
     * 
     * // Joined guest fields (optional)
     * @param {string} [params.guest_name]
     * @param {string} [params.guest_category]
     * @param {string} [params.guest_phone]
     */
    constructor({
        magic_link_id,
        company_id,
        branch_id = null,
        guest_id,
        token,
        expires_at = null,
        single_use = false,
        ip_lockdown = false,
        allowed_ip = null,
        locked_ip = null,
        use_count = 0,
        max_uses = null,
        is_revoked = false,
        created_at,
        updated_at,
        created_by = null,
        updated_by = null,
        guest_name = null,
        guest_category = null,
        guest_phone = null
    }) {
        this.magic_link_id = magic_link_id ? Number(magic_link_id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.guest_id = Number(guest_id);
        this.token = token;
        this.expires_at = expires_at ? new Date(expires_at) : null;
        this.single_use = Boolean(single_use);
        this.ip_lockdown = Boolean(ip_lockdown);
        this.allowed_ip = allowed_ip;
        this.locked_ip = locked_ip;
        this.use_count = Number(use_count);
        this.max_uses = max_uses !== null && max_uses !== undefined ? Number(max_uses) : (Boolean(single_use) ? 1 : null);
        this.is_revoked = Boolean(is_revoked);
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
        this.created_by = created_by ? Number(created_by) : null;
        this.updated_by = updated_by ? Number(updated_by) : null;

        // Populate optional joined guest info
        this.guest_name = guest_name;
        this.guest_category = guest_category;
        this.guest_phone = guest_phone;
    }

    /**
     * Determine the current dynamic state of the link
     * @returns {'Active' | 'Expiring Soon' | 'Expired' | 'Revoked' | 'Used'}
     */
    get status() {
        if (this.is_revoked) {
            return 'Revoked';
        }

        const now = new Date();

        // Expired check
        if (this.expires_at && this.expires_at <= now) {
            return 'Expired';
        }

        // Used check (single_use, or max_uses cap hit)
        if (this.max_uses !== null && this.use_count >= this.max_uses) {
            return 'Used';
        }

        // Expiring Soon check: within 24 hours of now
        if (this.expires_at) {
            const timeDiff = this.expires_at.getTime() - now.getTime();
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            if (hoursDiff > 0 && hoursDiff <= 24) {
                return 'Expiring Soon';
            }
        }

        return 'Active';
    }

    /**
     * Check if this magic link is valid and can be accessed
     * @param {string} [ipAddress] - Requesting IP address to validate against IP Lockdown rules
     * @returns {{ valid: boolean, reason?: string }}
     */
    validateAccess(ipAddress = null) {
        const currentStatus = this.status;
        
        if (currentStatus === 'Revoked') {
            return { valid: false, reason: 'Link has been revoked by administration' };
        }
        if (currentStatus === 'Expired') {
            return { valid: false, reason: 'Link has expired' };
        }
        if (currentStatus === 'Used') {
            return { valid: false, reason: 'Single-use link has already been used' };
        }

        // IP Lockdown enforcement
        if (this.ip_lockdown && ipAddress) {
            // Case 1: Pre-configured allowed IP
            if (this.allowed_ip && this.allowed_ip !== ipAddress) {
                return { valid: false, reason: `Access restricted to authorized IP range only` };
            }
            // Case 2: Dynamically locked on first use
            if (this.locked_ip && this.locked_ip !== ipAddress) {
                return { valid: false, reason: 'Link locked to a different IP address' };
            }
        }

        return { valid: true };
    }

    /**
     * Map database row directly to MagicLink instance
     * @param {Object} row 
     * @returns {MagicLink}
     */
    static fromRow(row) {
        if (!row) return null;
        return new MagicLink({
            magic_link_id: row.magic_link_id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            guest_id: row.guest_id,
            token: row.token,
            expires_at: row.expires_at,
            single_use: row.single_use,
            ip_lockdown: row.ip_lockdown,
            allowed_ip: row.allowed_ip,
            locked_ip: row.locked_ip,
            use_count: row.use_count,
            max_uses: row.max_uses,
            is_revoked: row.is_revoked,
            created_at: row.created_at,
            updated_at: row.updated_at,
            created_by: row.created_by,
            updated_by: row.updated_by,
            guest_name: row.guest_name,
            guest_category: row.guest_category,
            guest_phone: row.guest_phone
        });
    }
}

module.exports = MagicLink;
