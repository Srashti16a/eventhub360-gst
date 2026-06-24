/**
 * LayoutValidationLog Entity Model
 */
class LayoutValidationLog {
    /**
     * @param {Object} params
     * @param {number} [params.log_id]
     * @param {number} params.company_id
     * @param {number} params.layout_id
     * @param {number} [params.rule_id]
     * @param {'Info' | 'Warning' | 'Critical'} [params.severity]
     * @param {string} params.message
     * @param {Object} [params.details]
     * @param {boolean} [params.resolved]
     * @param {Date|string} [params.resolved_at]
     * @param {Date|string} [params.created_at]
     * 
     * // Joined parameters
     * @param {string} [params.rule_name]
     */
    constructor({
        log_id,
        company_id,
        layout_id,
        rule_id = null,
        severity = 'Warning',
        message,
        details = {},
        resolved = false,
        resolved_at = null,
        created_at,
        rule_name = null
    }) {
        this.log_id = log_id ? Number(log_id) : undefined;
        this.company_id = Number(company_id);
        this.layout_id = Number(layout_id);
        this.rule_id = rule_id ? Number(rule_id) : null;
        this.severity = severity;
        this.message = message;
        this.details = typeof details === 'object' ? details : {};
        this.resolved = Boolean(resolved);
        this.resolved_at = resolved_at ? new Date(resolved_at) : null;
        this.created_at = created_at ? new Date(created_at) : undefined;

        // Joined properties
        this.rule_name = rule_name;
    }

    /**
     * Map database row directly to LayoutValidationLog Entity instance
     * @param {Object} row 
     * @returns {LayoutValidationLog}
     */
    static fromRow(row) {
        if (!row) return null;
        return new LayoutValidationLog({
            log_id: row.log_id,
            company_id: row.company_id,
            layout_id: row.layout_id,
            rule_id: row.rule_id,
            severity: row.severity,
            message: row.message,
            details: row.details,
            resolved: row.resolved,
            resolved_at: row.resolved_at,
            created_at: row.created_at,
            rule_name: row.rule_name
        });
    }
}

module.exports = LayoutValidationLog;
