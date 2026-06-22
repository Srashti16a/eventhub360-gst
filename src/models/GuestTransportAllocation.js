/**
 * GuestTransportAllocation Entity Model
 */
class GuestTransportAllocation {
    /**
     * @param {Object} params
     * @param {number} [params.allocation_id]
     * @param {number} params.guest_id
     * @param {number} params.vehicle_id
     * @param {number} params.assigned_by
     * @param {Date|string} [params.assigned_at]
     * @param {'Assigned' | 'Reserved' | 'Checked In' | 'Checked Out'} [params.allocation_status]
     * 
     * // Joined guest & vehicle fields
     * @param {string} [params.guest_name]
     * @param {string} [params.guest_category]
     * @param {string} [params.vehicle_name]
     * @param {string} [params.license_number]
     */
    constructor({
        allocation_id,
        guest_id,
        vehicle_id,
        assigned_by,
        assigned_at,
        allocation_status = 'Assigned',
        guest_name = null,
        guest_category = null,
        vehicle_name = null,
        license_number = null
    }) {
        this.allocation_id = allocation_id ? Number(allocation_id) : undefined;
        this.guest_id = Number(guest_id);
        this.vehicle_id = Number(vehicle_id);
        this.assigned_by = Number(assigned_by);
        this.assigned_at = assigned_at ? new Date(assigned_at) : undefined;
        this.allocation_status = allocation_status;

        // Joined properties
        this.guest_name = guest_name;
        this.guest_category = guest_category;
        this.vehicle_name = vehicle_name;
        this.license_number = license_number;
    }

    /**
     * Map database row directly to GuestTransportAllocation Entity instance
     * @param {Object} row 
     * @returns {GuestTransportAllocation}
     */
    static fromRow(row) {
        if (!row) return null;
        return new GuestTransportAllocation({
            allocation_id: row.allocation_id,
            guest_id: row.guest_id,
            vehicle_id: row.vehicle_id,
            assigned_by: row.assigned_by,
            assigned_at: row.assigned_at,
            allocation_status: row.allocation_status,
            guest_name: row.guest_name,
            guest_category: row.guest_category,
            vehicle_name: row.vehicle_name,
            license_number: row.license_number
        });
    }
}

module.exports = GuestTransportAllocation;
