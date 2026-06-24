/**
 * TableLayout Entity Model
 */
class TableLayout {
    /**
     * @param {Object} params
     * @param {number} [params.layout_id]
     * @param {number} params.company_id
     * @param {number} [params.branch_id]
     * @param {number} params.event_id
     * @param {string} params.name
     * @param {string} [params.version]
     * @param {'Draft' | 'Saved' | 'Finalized'} [params.status]
     * @param {boolean} [params.is_active]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     * @param {number} [params.created_by]
     * @param {number} [params.updated_by]
     */
    constructor({
        layout_id,
        company_id,
        branch_id = null,
        event_id,
        name,
        version = '1.0.0',
        status = 'Draft',
        is_active = true,
        created_at,
        updated_at,
        created_by = null,
        updated_by = null
    }) {
        this.layout_id = layout_id ? Number(layout_id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.event_id = Number(event_id);
        this.name = name;
        this.version = version;
        this.status = status;
        this.is_active = Boolean(is_active);
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
        this.created_by = created_by ? Number(created_by) : null;
        this.updated_by = updated_by ? Number(updated_by) : null;
    }

    /**
     * Map database row directly to TableLayout Entity instance
     * @param {Object} row 
     * @returns {TableLayout}
     */
    static fromRow(row) {
        if (!row) return null;
        return new TableLayout({
            layout_id: row.layout_id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            event_id: row.event_id,
            name: row.name,
            version: row.version,
            status: row.status,
            is_active: row.is_active,
            created_at: row.created_at,
            updated_at: row.updated_at,
            created_by: row.created_by,
            updated_by: row.updated_by
        });
    }
}

module.exports = TableLayout;
