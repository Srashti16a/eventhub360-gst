/**
 * SatisfactionAnalytics Entity Model
 */
class SatisfactionAnalytics {
    constructor({
        id,
        company_id,
        event_id,
        average_score = 0.00,
        total_responses = 0,
        updated_at
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.event_id = Number(event_id);
        this.average_score = Number(average_score);
        this.total_responses = Number(total_responses);
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
    }

    static fromRow(row) {
        if (!row) return null;
        return new SatisfactionAnalytics({
            id: row.id,
            company_id: row.company_id,
            event_id: row.event_id,
            average_score: row.average_score,
            total_responses: row.total_responses,
            updated_at: row.updated_at
        });
    }
}

module.exports = SatisfactionAnalytics;
