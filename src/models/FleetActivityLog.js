/**
 * FleetActivityLog Entity Model
 */
class FleetActivityLog {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number} [params.branch_id]
     * @param {'Route Completed' | 'Dispatch Alert' | 'Maintenance Alert' | 'Assignment Update' | 'Driver Status Change' | 'Conflict Detected'} params.activity_type
     * @param {'Info' | 'Warning' | 'Critical'} [params.severity]
     * @param {string} params.message
     * @param {number} [params.vehicle_id]
     * @param {number} [params.driver_id]
     * @param {Date|string} [params.created_at]
     * 
     * // Joined details
     * @param {string} [params.vehicle_name]
     * @param {string} [params.driver_name]
     */
    constructor({
        id,
        company_id,
        branch_id = null,
        activity_type,
        severity = 'Info',
        message,
        vehicle_id = null,
        driver_id = null,
        created_at,
        vehicle_name = null,
        driver_name = null
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.activity_type = activity_type;
        this.severity = severity;
        this.message = message;
        this.vehicle_id = vehicle_id ? Number(vehicle_id) : null;
        this.driver_id = driver_id ? Number(driver_id) : null;
        this.created_at = created_at ? new Date(created_at) : undefined;

        // Joined properties
        this.vehicle_name = vehicle_name;
        this.driver_name = driver_name;
    }

    /**
     * Map database row directly to FleetActivityLog instance
     * @param {Object} row 
     * @returns {FleetActivityLog}
     */
    static fromRow(row) {
        if (!row) return null;
        return new FleetActivityLog({
            id: row.id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            activity_type: row.activity_type,
            severity: row.severity,
            message: row.message,
            vehicle_id: row.vehicle_id,
            driver_id: row.driver_id,
            created_at: row.created_at,
            vehicle_name: row.vehicle_name,
            driver_name: row.driver_name
        });
    }
}

module.exports = FleetActivityLog;
