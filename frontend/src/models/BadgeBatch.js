/**
 * BadgeBatch Entity Model
 */
class BadgeBatch {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number} params.event_id
     * @param {string} params.batch_name
     * @param {number} params.total_badges
     * @param {number} [params.generated_count]
     * @param {'Pending' | 'Processing' | 'Completed' | 'Failed'} [params.status]
     * @param {Date|string} [params.created_at]
     */
    constructor({
        id,
        company_id,
        event_id,
        batch_name,
        total_badges,
        generated_count = 0,
        status = 'Pending',
        created_at
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.event_id = Number(event_id);
        this.batch_name = batch_name;
        this.total_badges = Number(total_badges);
        this.generated_count = Number(generated_count);
        this.status = status;
        this.created_at = created_at ? new Date(created_at) : undefined;
    }

    /**
     * Map database row directly to BadgeBatch Entity instance
     * @param {Object} row 
     * @returns {BadgeBatch}
     */
    static fromRow(row) {
        if (!row) return null;
        return new BadgeBatch({
            id: row.id,
            company_id: row.company_id,
            event_id: row.event_id,
            batch_name: row.batch_name,
            total_badges: row.total_badges,
            generated_count: row.generated_count,
            status: row.status,
            created_at: row.created_at
        });
    }
}

module.exports = BadgeBatch;
