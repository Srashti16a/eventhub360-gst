/**
 * ReportTemplate Entity Model
 */
class ReportTemplate {
    constructor({
        id,
        company_id,
        name,
        description = null,
        group_by_column = null,
        filter_criteria = {},
        sort_criteria = {},
        created_at,
        updated_at
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.name = name;
        this.description = description;
        this.group_by_column = group_by_column;
        this.filter_criteria = typeof filter_criteria === 'string' ? JSON.parse(filter_criteria) : filter_criteria;
        this.sort_criteria = typeof sort_criteria === 'string' ? JSON.parse(sort_criteria) : sort_criteria;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
    }

    static fromRow(row) {
        if (!row) return null;
        return new ReportTemplate({
            id: row.id,
            company_id: row.company_id,
            name: row.name,
            description: row.description,
            group_by_column: row.group_by_column,
            filter_criteria: row.filter_criteria,
            sort_criteria: row.sort_criteria,
            created_at: row.created_at,
            updated_at: row.updated_at
        });
    }
}

module.exports = ReportTemplate;
