/**
 * BatchPassGeneration Entity Model
 */
class BatchPassGeneration {
    /**
     * @param {Object} params
     * @param {number} [params.batch_id]
     * @param {number} params.company_id
     * @param {number} params.event_id
     * @param {string} params.pass_type
     * @param {number} params.total_passes
     * @param {number} [params.generated_count]
     * @param {'Processing' | 'Completed' | 'Failed'} [params.status]
     * @param {string} [params.error_log]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.completed_at]
     */
    constructor({
        batch_id,
        company_id,
        event_id,
        pass_type,
        total_passes,
        generated_count = 0,
        status = 'Processing',
        error_log = null,
        created_at,
        completed_at = null
    }) {
        this.batch_id = batch_id ? Number(batch_id) : undefined;
        this.company_id = Number(company_id);
        this.event_id = Number(event_id);
        this.pass_type = pass_type;
        this.total_passes = Number(total_passes);
        this.generated_count = Number(generated_count);
        this.status = status;
        this.error_log = error_log;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.completed_at = completed_at ? new Date(completed_at) : null;
    }

    /**
     * Map database row directly to BatchPassGeneration Entity instance
     * @param {Object} row 
     * @returns {BatchPassGeneration}
     */
    static fromRow(row) {
        if (!row) return null;
        return new BatchPassGeneration({
            batch_id: row.batch_id,
            company_id: row.company_id,
            event_id: row.event_id,
            pass_type: row.pass_type,
            total_passes: row.total_passes,
            generated_count: row.generated_count,
            status: row.status,
            error_log: row.error_log,
            created_at: row.created_at,
            completed_at: row.completed_at
        });
    }
}

module.exports = BatchPassGeneration;
