/**
 * CommunicationTemplate Entity Model
 */
class CommunicationTemplate {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number|null} [params.branch_id]
     * @param {string} params.name
     * @param {'Email' | 'WhatsApp' | 'SMS'} params.channel
     * @param {string|null} [params.subject]
     * @param {string} params.content
     * @param {string[]|string} [params.variables]
     * @param {boolean} [params.is_active]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     */
    constructor({
        id,
        company_id,
        branch_id = null,
        name,
        channel,
        subject = null,
        content,
        variables = [],
        is_active = true,
        created_at,
        updated_at
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.name = name;
        this.channel = channel;
        this.subject = subject;
        this.content = content;
        this.variables = typeof variables === 'string' ? JSON.parse(variables) : variables;
        this.is_active = !!is_active;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
    }

    /**
     * Map database row directly to CommunicationTemplate Entity instance
     * @param {Object} row 
     * @returns {CommunicationTemplate}
     */
    static fromRow(row) {
        if (!row) return null;
        return new CommunicationTemplate({
            id: row.id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            name: row.name,
            channel: row.channel,
            subject: row.subject,
            content: row.content,
            variables: row.variables,
            is_active: row.is_active,
            created_at: row.created_at,
            updated_at: row.updated_at
        });
    }
}

module.exports = CommunicationTemplate;
