/**
 * RouteOptimizationLog Entity Model
 */
class RouteOptimizationLog {
    /**
     * @param {Object} params
     * @param {number} [params.log_id]
     * @param {number} params.vehicle_id
     * @param {Object|string} params.optimization_result
     * @param {number} params.generated_by
     * @param {Date|string} [params.created_at]
     */
    constructor({
        log_id,
        vehicle_id,
        optimization_result,
        generated_by,
        created_at
    }) {
        this.log_id = log_id ? Number(log_id) : undefined;
        this.vehicle_id = Number(vehicle_id);
        this.optimization_result = typeof optimization_result === 'string' ? JSON.parse(optimization_result) : optimization_result;
        this.generated_by = Number(generated_by);
        this.created_at = created_at ? new Date(created_at) : undefined;
    }

    /**
     * Map database row directly to RouteOptimizationLog instance
     * @param {Object} row 
     * @returns {RouteOptimizationLog}
     */
    static fromRow(row) {
        if (!row) return null;
        return new RouteOptimizationLog({
            log_id: row.log_id,
            vehicle_id: row.vehicle_id,
            optimization_result: row.optimization_result,
            generated_by: row.generated_by,
            created_at: row.created_at
        });
    }
}

module.exports = RouteOptimizationLog;
