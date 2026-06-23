/**
 * FleetAnalytics Entity Model
 */
class FleetAnalytics {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number} [params.branch_id]
     * @param {number} params.event_id
     * @param {number} [params.total_vehicles]
     * @param {number} [params.active_drivers]
     * @param {number} [params.on_route_vehicles]
     * @param {number} [params.efficiency_rating]
     * @param {Date|string} [params.recorded_date]
     * @param {Date|string} [params.created_at]
     * 
     * // Joined details
     * @param {string} [params.event_name]
     */
    constructor({
        id,
        company_id,
        branch_id = null,
        event_id,
        total_vehicles = 0,
        active_drivers = 0,
        on_route_vehicles = 0,
        efficiency_rating = 0.00,
        recorded_date,
        created_at,
        event_name = null
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.event_id = Number(event_id);
        this.total_vehicles = Number(total_vehicles);
        this.active_drivers = Number(active_drivers);
        this.on_route_vehicles = Number(on_route_vehicles);
        this.efficiency_rating = Number(efficiency_rating);
        this.recorded_date = recorded_date ? new Date(recorded_date) : undefined;
        this.created_at = created_at ? new Date(created_at) : undefined;

        // Joined properties
        this.event_name = event_name;
    }

    /**
     * Map database row directly to FleetAnalytics instance
     * @param {Object} row 
     * @returns {FleetAnalytics}
     */
    static fromRow(row) {
        if (!row) return null;
        return new FleetAnalytics({
            id: row.id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            event_id: row.event_id,
            total_vehicles: row.total_vehicles,
            active_drivers: row.active_drivers,
            on_route_vehicles: row.on_route_vehicles,
            efficiency_rating: row.efficiency_rating,
            recorded_date: row.recorded_date,
            created_at: row.created_at,
            event_name: row.event_name
        });
    }
}

module.exports = FleetAnalytics;
