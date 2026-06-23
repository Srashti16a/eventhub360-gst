/**
 * VehicleMaintenance Entity Model
 */
class VehicleMaintenance {
    /**
     * @param {Object} params
     * @param {number} [params.id]
     * @param {number} params.company_id
     * @param {number} [params.branch_id]
     * @param {number} params.vehicle_id
     * @param {'Oil Change' | 'Tire Rotation' | 'Engine Repair' | 'Fuel Warning' | 'Routine Inspection' | 'Other'} params.maintenance_type
     * @param {string} [params.description]
     * @param {Date|string} params.scheduled_date
     * @param {Date|string} [params.completed_date]
     * @param {'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'} [params.status]
     * @param {number} [params.cost]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     * 
     * // Joined details
     * @param {string} [params.vehicle_name]
     * @param {string} [params.license_number]
     */
    constructor({
        id,
        company_id,
        branch_id = null,
        vehicle_id,
        maintenance_type,
        description = null,
        scheduled_date,
        completed_date = null,
        status = 'Scheduled',
        cost = 0.00,
        created_at,
        updated_at,
        vehicle_name = null,
        license_number = null
    }) {
        this.id = id ? Number(id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.vehicle_id = Number(vehicle_id);
        this.maintenance_type = maintenance_type;
        this.description = description;
        this.scheduled_date = scheduled_date ? new Date(scheduled_date) : undefined;
        this.completed_date = completed_date ? new Date(completed_date) : null;
        this.status = status;
        this.cost = Number(cost);
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;

        // Joined properties
        this.vehicle_name = vehicle_name;
        this.license_number = license_number;
    }

    /**
     * Map database row directly to VehicleMaintenance instance
     * @param {Object} row 
     * @returns {VehicleMaintenance}
     */
    static fromRow(row) {
        if (!row) return null;
        return new VehicleMaintenance({
            id: row.id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            vehicle_id: row.vehicle_id,
            maintenance_type: row.maintenance_type,
            description: row.description,
            scheduled_date: row.scheduled_date,
            completed_date: row.completed_date,
            status: row.status,
            cost: row.cost,
            created_at: row.created_at,
            updated_at: row.updated_at,
            vehicle_name: row.vehicle_name,
            license_number: row.license_number
        });
    }
}

module.exports = VehicleMaintenance;
