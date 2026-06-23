/**
 * FleetAssignment Entity Model
 */
class FleetAssignment {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number} [params.branch_id]
     * @param {number} params.vehicle_id
     * @param {number} params.driver_id
     * @param {number} params.event_id
     * @param {'Active' | 'Completed' | 'Cancelled'} [params.status]
     * @param {Date|string} [params.assigned_at]
     * @param {Date|string} [params.updated_at]
     * 
     * // Joined details
     * @param {string} [params.vehicle_name]
     * @param {string} [params.driver_name]
     * @param {string} [params.event_name]
     */
    constructor({
        id,
        company_id,
        branch_id = null,
        vehicle_id,
        driver_id,
        event_id,
        status = 'Active',
        assigned_at,
        updated_at,
        vehicle_name = null,
        driver_name = null,
        event_name = null
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.vehicle_id = Number(vehicle_id);
        this.driver_id = Number(driver_id);
        this.event_id = Number(event_id);
        this.status = status;
        this.assigned_at = assigned_at ? new Date(assigned_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;

        // Joined properties
        this.vehicle_name = vehicle_name;
        this.driver_name = driver_name;
        this.event_name = event_name;
    }

    /**
     * Map database row directly to FleetAssignment instance
     * @param {Object} row 
     * @returns {FleetAssignment}
     */
    static fromRow(row) {
        if (!row) return null;
        return new FleetAssignment({
            id: row.id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            vehicle_id: row.vehicle_id,
            driver_id: row.driver_id,
            event_id: row.event_id,
            status: row.status,
            assigned_at: row.assigned_at,
            updated_at: row.updated_at,
            vehicle_name: row.vehicle_name,
            driver_name: row.driver_name,
            event_name: row.event_name
        });
    }
}

module.exports = FleetAssignment;
