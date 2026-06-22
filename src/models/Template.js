/**
 * Template Entity Model
 */
class Template {
    /**
     * @param {Object} params
     * @param {number} [params.template_id]
     * @param {number} params.company_id
     * @param {number} [params.branch_id]
     * @param {string} params.name
     * @param {'EMAIL' | 'WHATSAPP'} params.channel
     * @param {string} [params.category]
     * @param {'DRAFT' | 'PUBLISHED' | 'ARCHIVED'} [params.status]
     * @param {string} [params.subject]
     * @param {Object} [params.content]
     * @param {string[]} [params.variables]
     * @param {boolean} [params.is_active]
     * @param {Date} [params.created_at]
     * @param {Date} [params.updated_at]
     * @param {number} [params.created_by]
     * @param {number} [params.updated_by]
     */
    constructor({
        template_id,
        company_id,
        branch_id,
        name,
        channel,
        category = 'Invitation',
        status = 'DRAFT',
        subject = null,
        content = {},
        variables = [],
        is_active = true,
        created_at,
        updated_at,
        created_by,
        updated_by
    }) {
        this.template_id = template_id ? Number(template_id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.name = name;
        this.channel = channel;
        this.category = category;
        this.status = status;
        this.subject = subject;
        this.content = typeof content === 'string' ? JSON.parse(content) : content;
        this.variables = Array.isArray(variables) ? variables : (typeof variables === 'string' ? JSON.parse(variables) : []);
        this.is_active = Boolean(is_active);
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
        this.created_by = created_by ? Number(created_by) : null;
        this.updated_by = updated_by ? Number(updated_by) : null;
    }

    /**
     * Map database row directly to Template Entity instance
     * @param {Object} row 
     * @returns {Template}
     */
    static fromRow(row) {
        if (!row) return null;
        return new Template({
            template_id: row.template_id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            name: row.name,
            channel: row.channel,
            category: row.category,
            status: row.status,
            subject: row.subject,
            content: row.content,
            variables: row.variables,
            is_active: row.is_active,
            created_at: row.created_at,
            updated_at: row.updated_at,
            created_by: row.created_by,
            updated_by: row.updated_by
        });
    }
}

module.exports = Template;
