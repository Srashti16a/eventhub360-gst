/**
 * PassSecurityAudit Entity Model
 */
class PassSecurityAudit {
    /**
     * @param {Object} params
     * @param {number} [params.audit_id]
     * @param {number} params.company_id
     * @param {number} params.pass_id
     * @param {'Validation Check' | 'Hash Regenerated' | 'Tamper Detected' | 'Token Signature Verification'} params.action_type
     * @param {string} params.ip_address
     * @param {string} [params.user_agent]
     * @param {boolean} [params.hash_verified]
     * @param {Object} [params.details]
     * @param {Date|string} [params.created_at]
     */
    constructor({
        audit_id,
        company_id,
        pass_id,
        action_type,
        ip_address,
        user_agent = null,
        hash_verified = true,
        details = {},
        created_at
    }) {
        this.audit_id = audit_id ? Number(audit_id) : undefined;
        this.company_id = Number(company_id);
        this.pass_id = Number(pass_id);
        this.action_type = action_type;
        this.ip_address = ip_address;
        this.user_agent = user_agent;
        this.hash_verified = Boolean(hash_verified);
        this.details = typeof details === 'object' ? details : {};
        this.created_at = created_at ? new Date(created_at) : undefined;
    }

    /**
     * Map database row directly to PassSecurityAudit Entity instance
     * @param {Object} row 
     * @returns {PassSecurityAudit}
     */
    static fromRow(row) {
        if (!row) return null;
        return new PassSecurityAudit({
            audit_id: row.audit_id,
            company_id: row.company_id,
            pass_id: row.pass_id,
            action_type: row.action_type,
            ip_address: row.ip_address,
            user_agent: row.user_agent,
            hash_verified: row.hash_verified,
            details: row.details,
            created_at: row.created_at
        });
    }
}

module.exports = PassSecurityAudit;
