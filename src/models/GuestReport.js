/**
 * GuestReport Entity Model
 */
class GuestReport {
    constructor({
        id,
        company_id,
        event_id,
        name,
        description = null,
        template_id = null,
        created_at,
        updated_at
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.event_id = Number(event_id);
        this.name = name;
        this.description = description;
        this.template_id = template_id ? Number(template_id) : null;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
    }

    static fromRow(row) {
        if (!row) return null;
        return new GuestReport({
            id: row.id,
            company_id: row.company_id,
            event_id: row.event_id,
            name: row.name,
            description: row.description,
            template_id: row.template_id,
            created_at: row.created_at,
            updated_at: row.updated_at
        });
    }
}

module.exports = GuestReport;
