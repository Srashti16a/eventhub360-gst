/**
 * Vehicle Entity Model
 */
class Vehicle {
    /**
     * @param {Object} params
     * @param {number} [params.vehicle_id]
     * @param {number} params.company_id
     * @param {number} [params.branch_id]
     * @param {string} params.vehicle_name
     * @param {string} params.vehicle_type
     * @param {string} params.license_number
     * @param {number} params.capacity
     * @param {'On Route' | 'Staged' | 'Maintenance' | 'Available'} [params.status]
     * @param {number} [params.driver_id]
     * @param {Date|string} [params.created_at]
     * @param {Date|string} [params.updated_at]
     * 
     * // Joined driver properties
     * @param {string} [params.driver_name]
     */
    constructor({
        vehicle_id,
        company_id,
        branch_id = null,
        vehicle_name,
        vehicle_type,
        license_number,
        capacity,
        status = 'Available',
        driver_id = null,
        created_at,
        updated_at,
        driver_name = null
    }) {
        this.vehicle_id = vehicle_id ? Number(vehicle_id) : undefined;
        this.company_id = Number(company_id);
        this.branch_id = branch_id ? Number(branch_id) : null;
        this.vehicle_name = vehicle_name;
        this.vehicle_type = vehicle_type;
        this.license_number = license_number;
        this.capacity = Number(capacity);
        this.status = status;
        this.driver_id = driver_id ? Number(driver_id) : null;
        this.created_at = created_at ? new Date(created_at) : undefined;
        this.updated_at = updated_at ? new Date(updated_at) : undefined;

        // Joined driver info
        this.driver_name = driver_name;
    }

    /**
     * Map database row directly to Vehicle Entity instance
     * @param {Object} row 
     * @returns {Vehicle}
     */
    static fromRow(row) {
        if (!row) return null;
        return new Vehicle({
            vehicle_id: row.vehicle_id,
            company_id: row.company_id,
            branch_id: row.branch_id,
            vehicle_name: row.vehicle_name,
            vehicle_type: row.vehicle_type,
            license_number: row.license_number,
            capacity: row.capacity,
            status: row.status,
            driver_id: row.driver_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
            driver_name: row.driver_name
        });
    }
}

module.exports = Vehicle;
