/**
 * AudienceSegment Entity Model
 */
class AudienceSegment {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {string} params.name
     * @param {string|null} [params.description]
     * @param {Object|string} [params.rules]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     */
    constructor({
        id,
        company_id,
        name,
        description = null,
        rules = {},
        created_at,
        updated_at
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.name = name;
        this.description = description;
        this.rules = typeof rules === 'string' ? JSON.parse(rules) : rules;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
    }

    /**
     * Map database row directly to AudienceSegment Entity instance
     * @param {Object} row 
     * @returns {AudienceSegment}
     */
    static fromRow(row) {
        if (!row) return null;
        return new AudienceSegment({
            id: row.id,
            company_id: row.company_id,
            name: row.name,
            description: row.description,
            rules: row.rules,
            created_at: row.created_at,
            updated_at: row.updated_at
        });
    }
}

module.exports = AudienceSegment;
