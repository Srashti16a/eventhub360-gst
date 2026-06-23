/**
 * PassRevocationLog Entity Model
 */
class PassRevocationLog {
    /**
     * @param {Object} params
     * @param {number} [params.revocation_id]
     * @param {number} params.company_id
     * @param {number} params.pass_id
     * @param {number} params.revoked_by
     * @param {string} params.revocation_reason
     * @param {Date|string} [params.revoked_at]
     */
    constructor({
        revocation_id,
        company_id,
        pass_id,
        revoked_by,
        revocation_reason,
        revoked_at
    }) {
        this.revocation_id = revocation_id ? Number(revocation_id) : undefined;
        this.company_id = Number(company_id);
        this.pass_id = Number(pass_id);
        this.revoked_by = Number(revoked_by);
        this.revocation_reason = revocation_reason;
        this.revoked_at = revoked_at ? new Date(revoked_at) : undefined;
    }

    /**
     * Map database row directly to PassRevocationLog Entity instance
     * @param {Object} row 
     * @returns {PassRevocationLog}
     */
    static fromRow(row) {
        if (!row) return null;
        return new PassRevocationLog({
            revocation_id: row.revocation_id,
            company_id: row.company_id,
            pass_id: row.pass_id,
            revoked_by: row.revoked_by,
            revocation_reason: row.revocation_reason,
            revoked_at: row.revoked_at
        });
    }
}

module.exports = PassRevocationLog;
