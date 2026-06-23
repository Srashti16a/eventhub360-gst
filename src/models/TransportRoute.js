/**
 * TransportRoute Entity Model
 */
class TransportRoute {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number} [params.branch_id]
     * @param {string} params.route_name
     * @param {string} params.start_location
     * @param {string} params.end_location
     * @param {number} params.distance_km
     * @param {number} params.duration_mins
     * @param {'Active' | 'Inactive'} [params.status]
     * @param {Date|string} [params.optimized_at]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     */
    constructor({
        id,
        company_id,
        branch_id = null,
        route_name,
        start_location,
        end_location,
        distance_km,
        duration_mins,
        status = 'Active',
        optimized_at = null,
        created_at,
        updated_at
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.route_name = route_name;
        this.start_location = start_location;
        this.end_location = end_location;
        this.distance_km = Number(distance_km);
        this.duration_mins = Number(duration_mins);
        this.status = status;
        this.optimized_at = optimized_at ? new Date(optimized_at) : null;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;
    }

    /**
     * Map database row directly to TransportRoute instance
     * @param {Object} row 
     * @returns {TransportRoute}
     */
    static fromRow(row) {
        if (!row) return null;
        return new TransportRoute({
            id: row.id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            route_name: row.route_name,
            start_location: row.start_location,
            end_location: row.end_location,
            distance_km: row.distance_km,
            duration_mins: row.duration_mins,
            status: row.status,
            optimized_at: row.optimized_at,
            created_at: row.created_at,
            updated_at: row.updated_at
        });
    }
}

module.exports = TransportRoute;
