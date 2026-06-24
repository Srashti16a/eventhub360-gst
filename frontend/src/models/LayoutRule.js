/**
 * LayoutRule Entity Model
 */
class LayoutRule {
    /**
     * @param {Object} params
     * @param {number} [params.rule_id]
     * @param {number} params.company_id
     * @param {number} params.event_id
     * @param {string} params.rule_name
     * @param {'Spacing Clearance' | 'Max Capacity' | 'VIP Exclusivity'} params.rule_type
     * @param {Object} [params.rule_configuration]
     * @param {boolean} [params.is_enabled]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     */
    constructor({
        rule_id,
        company_id,
        event_id,
        rule_name,
        rule_type,
        rule_configuration = {},
        is_enabled = true,
        created_at,
        updated_at
    }) {
        this.rule_id = rule_id ? Number(rule_id) : undefined;
        this.company_id = Number(company_id);
        this.event_id = Number(event_id);
        this.rule_name = rule_name;
        this.rule_type = rule_type;
        this.rule_configuration = typeof rule_configuration === 'object' ? rule_configuration : {};
        this.is_enabled = Boolean(is_enabled);
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
    }

    /**
     * Map database row directly to LayoutRule Entity instance
     * @param {Object} row 
     * @returns {LayoutRule}
     */
    static fromRow(row) {
        if (!row) return null;
        return new LayoutRule({
            rule_id: row.rule_id,
            company_id: row.company_id,
            event_id: row.event_id,
            rule_name: row.rule_name,
            rule_type: row.rule_type,
            rule_configuration: row.rule_configuration,
            is_enabled: row.is_enabled,
            created_at: row.created_at,
            updated_at: row.updated_at
        });
    }
}

module.exports = LayoutRule;
