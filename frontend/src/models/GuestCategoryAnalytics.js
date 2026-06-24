/**
 * GuestCategoryAnalytics Entity Model
 */
class GuestCategoryAnalytics {
    constructor({
        id,
        company_id,
        event_id,
        category,
        total_count = 0,
        confirmed_count = 0,
        checked_in_count = 0,
        updated_at
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.event_id = Number(event_id);
        this.category = category;
        this.total_count = Number(total_count);
        this.confirmed_count = Number(confirmed_count);
        this.checked_in_count = Number(checked_in_count);
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
    }

    static fromRow(row) {
        if (!row) return null;
        return new GuestCategoryAnalytics({
            id: row.id,
            company_id: row.company_id,
            event_id: row.event_id,
            category: row.category,
            total_count: row.total_count,
            confirmed_count: row.confirmed_count,
            checked_in_count: row.checked_in_count,
            updated_at: row.updated_at
        });
    }
}

module.exports = GuestCategoryAnalytics;
