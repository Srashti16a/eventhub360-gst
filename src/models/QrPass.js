/**
 * QrPass Entity Model
 */
class QrPass {
    /**
     * @param {Object} params
     * @param {number} [params.pass_id]
     * @param {number} params.company_id
     * @param {number} [params.branch_id]
     * @param {number} params.guest_id
     * @param {string} params.pass_code
     * @param {'VIP' | 'Attendee' | 'Staff' | 'Media' | 'Vendor'} params.pass_type
     * @param {'Active' | 'Scanned' | 'Revoked' | 'Expired'} [params.status]
     * @param {string} [params.qr_code_url]
     * @param {string} params.security_hash
     * @param {Date|string} params.expires_at
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     * @param {number} [params.created_by]
     * @param {number} [params.updated_by]
     * 
     * // Joined parameters
     * @param {string} [params.guest_name]
     * @param {string} [params.guest_email]
     */
    constructor({
        pass_id,
        company_id,
        branch_id = null,
        guest_id,
        pass_code,
        pass_type,
        status = 'Active',
        qr_code_url = null,
        security_hash,
        expires_at,
        created_at,
        updated_at,
        created_by = null,
        updated_by = null,
        guest_name = null,
        guest_email = null
    }) {
        this.pass_id = pass_id ? Number(pass_id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.guest_id = Number(guest_id);
        this.pass_code = pass_code;
        this.pass_type = pass_type;
        this.status = status;
        this.qr_code_url = qr_code_url;
        this.security_hash = security_hash;
        this.expires_at = new Date(expires_at);
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
        this.created_by = created_by ? Number(created_by) : null;
        this.updated_by = updated_by ? Number(updated_by) : null;

        // Joined properties
        this.guest_name = guest_name;
        this.guest_email = guest_email;
    }

    /**
     * Map database row directly to QrPass Entity instance
     * @param {Object} row 
     * @returns {QrPass}
     */
    static fromRow(row) {
        if (!row) return null;
        return new QrPass({
            pass_id: row.pass_id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            guest_id: row.guest_id,
            pass_code: row.pass_code,
            pass_type: row.pass_type,
            status: row.status,
            qr_code_url: row.qr_code_url,
            security_hash: row.security_hash,
            expires_at: row.expires_at,
            created_at: row.created_at,
            updated_at: row.updated_at,
            created_by: row.created_by,
            updated_by: row.updated_by,
            guest_name: row.guest_name,
            guest_email: row.guest_email
        });
    }
}

module.exports = QrPass;
