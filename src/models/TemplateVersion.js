/**
 * TemplateVersion Entity Model
 */
class TemplateVersion {
    /**
     * @param {Object} params
     * @param {number} [params.version_id]
     * @param {number} params.template_id
     * @param {number} params.version_number
     * @param {string} [params.subject]
     * @param {Object} params.content
     * @param {Date} [params.created_at]
     * @param {number} [params.created_by]
     */
    constructor({
        version_id,
        template_id,
        version_number,
        subject = null,
        content = {},
        created_at,
        created_by
    }) {
        this.version_id = version_id ? Number(version_id) : undefined;
        this.template_id = Number(template_id);
        this.version_number = Number(version_number);
        this.subject = subject;
        this.content = typeof content === 'string' ? JSON.parse(content) : content;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.created_by = created_by ? Number(created_by) : null;
    }

    /**
     * Map database row directly to TemplateVersion Entity instance
     * @param {Object} row 
     * @returns {TemplateVersion}
     */
    static fromRow(row) {
        if (!row) return null;
        return new TemplateVersion({
            version_id: row.version_id,
            template_id: row.template_id,
            version_number: row.version_number,
            subject: row.subject,
            content: row.content,
            created_at: row.created_at,
            created_by: row.created_by
        });
    }
}

module.exports = TemplateVersion;
