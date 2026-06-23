/**
 * PrintQueue Entity Model
 */
class PrintQueue {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number} params.print_job_id
     * @param {number} params.queue_position
     * @param {'Pending' | 'Processing' | 'Failed' | 'Completed'} [params.status]
     * @param {Date|string} [params.created_at]
     */
    constructor({
        id,
        company_id,
        print_job_id,
        queue_position,
        status = 'Pending',
        created_at
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.print_job_id = Number(print_job_id);
        this.queue_position = Number(queue_position);
        this.status = status;
        this.created_at = created_at ? new Date(created_at) : undefined;
    }

    /**
     * Map database row directly to PrintQueue Entity instance
     * @param {Object} row 
     * @returns {PrintQueue}
     */
    static fromRow(row) {
        if (!row) return null;
        return new PrintQueue({
            id: row.id,
            company_id: row.company_id,
            print_job_id: row.print_job_id,
            queue_position: row.queue_position,
            status: row.status,
            created_at: row.created_at
        });
    }
}

module.exports = PrintQueue;
